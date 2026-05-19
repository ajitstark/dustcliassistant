import type { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { ingestPaths } from "../services/ingestion.js";
import { AnalysisPipeline } from "../agents/pipeline.js";
import { renderMarkdownReport } from "../services/report.js";
import { writeFile } from "node:fs/promises";
import { loadConfig } from "../services/config.js";
import { loadPlugins } from "../plugins/loader.js";
import { createChatProvider } from "../ai/factory.js";

export function registerReport(program: Command) {
  program
    .command("report")
    .argument("<path...>", "File or folder paths")
    .option("-o, --out <file>", "Output markdown file", "bug-report.md")
    .action(async (paths: string[], opts: { out: string }) => {
      const spinner = ora("Generating report...").start();
      const config = await loadConfig();
      const plugins = await loadPlugins(config.plugins);
      const { files, events } = await ingestPaths(paths, { maxLinesPerFile: 50000 });
      const pipeline = new AnalysisPipeline(createChatProvider(), plugins);
      const result = await pipeline.run({ files, events });
      const md = renderMarkdownReport(result);
      await writeFile(opts.out, md, "utf8");
      spinner.stop();
      console.log(chalk.green(`Wrote ${opts.out}`));
    });
}
