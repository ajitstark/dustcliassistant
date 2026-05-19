import type { Command } from "commander";
import ora from "ora";
import { parseLogChunk } from "../parsers/logParser.js";
import { AnalysisPipeline } from "../agents/pipeline.js";
import { renderInsightBox } from "../cli/ui.js";
import { startWebsocketServer } from "../websocket/server.js";
import { createChatProvider } from "../ai/factory.js";

export function registerLive(program: Command) {
  program
    .command("live")
    .description("Read lines from stdin and analyze in realtime (best with `tail -f`)")
    .option("--ws", "Also accept lines over WebSocket")
    .action(async (opts: { ws?: boolean }) => {
      const spinner = ora("Listening on stdin... (Ctrl+C to stop)").start();
      const lines: string[] = [];
      const pushLine = (line: string) => {
        if (!line) return;
        lines.push(line);
        if (lines.length > 2000) lines.splice(0, lines.length - 2000);
      };

      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => {
        for (const l of String(chunk).split(/\r?\n/)) pushLine(l);
      });

      const wss = opts.ws ? startWebsocketServer(async (line) => pushLine(line)) : undefined;

      const interval = setInterval(async () => {
        if (lines.length === 0) return;
        const snapshot = lines.splice(0, lines.length);
        const { events } = ingestFromLines(snapshot);
        const pipeline = new AnalysisPipeline(createChatProvider());
        const result = await pipeline.run({ files: [], events });
        if (result.insight) {
          spinner.stop();
          console.log(
            renderInsightBox({
              problem: result.insight.likelyIssue,
              severity: result.insight.severity,
              confidence: result.insight.confidence,
              fixes: result.insight.suggestions,
              commands: result.insight.commands
            })
          );
          spinner.start();
        }
      }, 2500);

      process.on("SIGINT", () => {
        clearInterval(interval);
        wss?.close();
        spinner.stop();
        process.exit(0);
      });
    });
}

function ingestFromLines(lines: string[]) {
  const events: Array<ReturnType<typeof parseLogChunk>> = [];
  let buf: string[] = [];
  const flush = () => {
    if (!buf.length) return;
    const ev = parseLogChunk(buf) as any;
    if (ev) events.push(ev);
    buf = [];
  };
  for (const line of lines) {
    if (line.trim() === "") flush();
    else buf.push(line);
  }
  flush();
  return { events: events.filter(Boolean) as any[] };
}
