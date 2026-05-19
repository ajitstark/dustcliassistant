import type { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { ingestPaths } from "../services/ingestion.js";
import { AnalysisPipeline } from "../agents/pipeline.js";
import { renderInsightBox } from "../cli/ui.js";
import { summarizeStack } from "../services/stackInsight.js";
import { createChatProvider } from "../ai/factory.js";

export function registerInspect(program: Command) {
  program
    .command("inspect")
    .argument("<file>", "Stacktrace file (.txt/.log)")
    .action(async (file: string) => {
      const spinner = ora("Inspecting stacktrace...").start();
      const { files, events } = await ingestPaths([file], { maxLinesPerFile: 20000 });
      const pipeline = new AnalysisPipeline(createChatProvider());
      const result = await pipeline.run({ files, events });
      spinner.stop();

      const first =
        result.groups.find((g) => g.sample.stack)?.sample ?? result.events.find((e) => e.stack);
      if (first) {
        const s = summarizeStack(first);
        if (s) {
          console.log(chalk.cyan("Probable source: ") + s.probableSource);
          console.log(chalk.cyan("Call chain:"));
          for (const f of s.callChain) console.log("  " + f);
          console.log("");
        }
      }

      if (result.insight) {
        console.log(
          renderInsightBox({
            problem: result.insight.likelyIssue,
            severity: result.insight.severity,
            confidence: result.insight.confidence,
            fixes: result.insight.suggestions,
            commands: result.insight.commands
          })
        );
      }
    });
}
