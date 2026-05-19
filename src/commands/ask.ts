import type { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import { envBool } from "../utils/env.js";
import { MemoryStore } from "../memory/memoryStore.js";
import { embedText } from "../embeddings/embedder.js";

export function registerAsk(program: Command) {
  program
    .command("ask")
    .description("Ask a question over stored debugging memory (semantic retrieval)")
    .action(async () => {
      if (!envBool("ENABLE_MEMORY", "true") || !envBool("ENABLE_EMBEDDINGS", "true")) {
        console.log(
          chalk.yellow("Memory/embeddings disabled. Set ENABLE_MEMORY/ENABLE_EMBEDDINGS=true.")
        );
        return;
      }
      const { q } = await inquirer.prompt<{ q: string }>([
        { type: "input", name: "q", message: "Question:" }
      ]);
      const store = new MemoryStore();
      const embedding = await embedText(q);
      const hits = await store.query({ embedding, n: 5 });
      if (!hits.length) {
        console.log(chalk.yellow("No semantic matches found."));
        return;
      }
      console.log(chalk.cyan("Top matches:"));
      for (const h of hits) {
        const fix = typeof h.metadata?.fix === "string" ? h.metadata.fix : "";
        console.log("- " + (h.document ?? h.id));
        if (fix)
          console.log(
            chalk.gray(
              "  Fix:\n" + fix.split("\n").map((l) => "  " + l).join("\n")
            )
          );
      }
    });
}

