import type { Command } from "commander";
import os from "node:os";
import process from "node:process";

function redactUrl(input: string): string {
  try {
    const url = new URL(input);
    if (url.username || url.password) {
      url.username = "REDACTED";
      url.password = "REDACTED";
    }
    return url.toString();
  } catch {
    return input;
  }
}

function yesNo(value: unknown): string {
  return value ? "yes" : "no";
}

export function registerSysinfo(program: Command) {
  program
    .command("sysinfo")
    .description("Print runtime and configuration info (no secrets)")
    .option("--json", "Output as JSON")
    .action(async () => {
      const outputJson = process.argv.includes("--json");
      const envVars = [
        "OPENAI_API_KEY",
        "OPENAI_MODEL",
        "OPENAI_EMBED_MODEL",
        "GEMINI_API_KEY",
        "GEMINI_MODEL",
        "GEMINI_EMBED_MODEL",
        "GITHUB_MODELS_TOKEN",
        "GITHUB_MODELS_MODEL",
        "GITHUB_MODELS_ORG",
        "GITHUB_API_VERSION",
        "DATABASE_URL",
        "REDIS_URL",
        "CHROMA_URL",
        "CHROMA_COLLECTION",
        "WS_PORT"
      ] as const;

      const envSummary: Record<string, { present: boolean; value?: string }> = {};
      for (const name of envVars) {
        const value = process.env[name];
        if (!value) {
          envSummary[name] = { present: false };
          continue;
        }
        const safeValue =
          name.endsWith("_KEY") ? "(set)" : name.endsWith("_URL") ? redactUrl(value) : value;
        envSummary[name] = { present: true, value: safeValue };
      }

      const info = {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        cpuCount: os.cpus()?.length ?? 0,
        hostname: os.hostname(),
        cwd: process.cwd(),
        env: envSummary
      };

      if (outputJson) {
        console.log(JSON.stringify(info, null, 2));
        return;
      }

      console.log(`node: ${info.node}`);
      console.log(`platform: ${info.platform} (${info.arch})`);
      console.log(`cpu: ${info.cpuCount}`);
      console.log(`hostname: ${info.hostname}`);
      console.log(`cwd: ${info.cwd}`);
      console.log("");
      console.log("env:");
      for (const name of envVars) {
        const entry = envSummary[name];
        const suffix = entry.present && entry.value ? ` = ${entry.value}` : "";
        console.log(`- ${name}: ${yesNo(entry.present)}${suffix}`);
      }
    });
}
