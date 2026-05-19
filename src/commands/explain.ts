import type { Command } from "commander";
import ora from "ora";
import { AnalysisPipeline } from "../agents/pipeline.js";
import { renderInsightBox } from "../cli/ui.js";
import { createChatProvider } from "../ai/factory.js";

export function registerExplain(program: Command) {
  program
    .command("explain")
    .argument("<text...>", "Issue text")
    .action(async (textParts: string[]) => {
      const text = textParts.join(" ");
      const spinner = ora("Thinking...").start();
      const pipeline = new AnalysisPipeline(createChatProvider());
      const result = await pipeline.run({
        files: [],
        events: [
          {
            severity: "ERROR",
            message: text,
            tags: [],
            raw: text
          }
        ]
      });
      spinner.stop();
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
