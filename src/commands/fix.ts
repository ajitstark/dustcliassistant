import type { Command } from "commander";
import chalk from "chalk";

export function registerFix(program: Command) {
  program
    .command("fix")
    .argument("<path...>", "File or folder paths")
    .action(async (paths: string[]) => {
      console.log(chalk.gray("`fix` currently aliases `analyze` with fix-oriented phrasing."));
      await program.parseAsync(["node", "dev-assistant", "analyze", ...paths]);
    });
}

