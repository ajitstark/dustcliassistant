import type { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { ingestPaths } from "../services/ingestion.js";
import { AnalysisPipeline } from "../agents/pipeline.js";
import { renderInsightBox } from "../cli/ui.js";
import { envBool } from "../utils/env.js";
import { MemoryStore } from "../memory/memoryStore.js";
import { loadConfig } from "../services/config.js";
import { loadPlugins } from "../plugins/loader.js";
import { createChatProvider } from "../ai/factory.js";

export function registerAnalyze(program: Command) {
  program
    .command("analyze")
    .argument("<path...>", "File or folder paths")
    .option("--max-lines <n>", "Max lines per file", (v) => Number(v), 20000)
    .action(async (paths: string[], opts: { maxLines: number }) => {
      const spinner = ora("Ingesting logs...").start();
      const config = await loadConfig();
      const plugins = await loadPlugins(config.plugins);
      const { files, events } = await ingestPaths(paths, { maxLinesPerFile: opts.maxLines });
      spinner.text = "Analyzing...";
      const pipeline = new AnalysisPipeline(createChatProvider(), plugins);
      const result = await pipeline.run({ files, events });
      spinner.stop();

      if (!result.insight) {
        console.log(chalk.yellow("No ERROR/FATAL groups found in provided inputs."));
        return;
      }

      console.log(
        renderInsightBox({
          problem: result.insight.likelyIssue,
          severity: result.insight.severity,
          confidence: result.insight.confidence,
          fixes: result.insight.suggestions,
          commands: result.insight.commands
        })
      );

      if (envBool("ENABLE_MEMORY", "true")) {
        const store = new MemoryStore();
        await store.upsert({
          error: result.insight.likelyIssue,
          fix: result.insight.suggestions.join("\n"),
          notes: result.insight.bugSummary,
          tags: result.groups[0]?.sample.tags ?? []
        });
      }
    });
}
