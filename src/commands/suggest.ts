import type { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import { getPrisma } from "../db/prisma.js";
import { renderInsightBox } from "../cli/ui.js";

export function registerSuggest(program: Command) {
  program
    .command("suggest")
    .description("Interactive suggestions from recent memory")
    .action(async () => {
      const prisma = getPrisma();
      const entries: Array<{ id: string; createdAt: Date; error: string; fix: string | null }> =
        await prisma.memoryEntry.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
      if (!entries.length) {
        console.log(chalk.yellow("No stored memory yet. Run analyze/report first."));
        return;
      }
      const { pick } = await inquirer.prompt<{ pick: string }>([
        {
          type: "list",
          name: "pick",
          message: "Pick a previous issue:",
          choices: entries.map((entry) => ({
            name: `${entry.createdAt.toISOString()} — ${entry.error}`,
            value: entry.id
          }))
        }
      ]);
      const chosen = entries.find((entry) => entry.id === pick)!;
      console.log(
        renderInsightBox({
          problem: chosen.error,
          severity: "MEDIUM",
          confidence: 60,
          fixes: (chosen.fix ?? "").split("\n").filter(Boolean),
          commands: []
        })
      );
    });
}

