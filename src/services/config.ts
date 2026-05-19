import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import type { DevAssistantConfig } from "../types/config.js";

const defaultConfig: DevAssistantConfig = {
  provider: "openai",
  embedding: true,
  memory: true,
  realtime: true,
  plugins: ["plugins/docker/index.js", "plugins/node/index.js", "plugins/kubernetes/index.js"]
};

export async function loadConfig(): Promise<DevAssistantConfig> {
  const tsPath = resolve(process.cwd(), "devassistant.config.ts");
  const jsPath = resolve(process.cwd(), "devassistant.config.js");

  if (existsSync(jsPath)) return merge(defaultConfig, await importConfig(jsPath));
  if (existsSync(tsPath)) {
    // Best-effort TS loading for local dev. For production, ship devassistant.config.js.
    try {
      await import("tsx/esm");
      return merge(defaultConfig, await importConfig(tsPath));
    } catch {
      return defaultConfig;
    }
  }
  return defaultConfig;
}

async function importConfig(path: string): Promise<Partial<DevAssistantConfig>> {
  const mod = (await import(pathToFileURL(path).href)) as any;
  return (mod.default ?? mod.config ?? {}) as Partial<DevAssistantConfig>;
}

function merge(a: DevAssistantConfig, b: Partial<DevAssistantConfig>): DevAssistantConfig {
  return {
    ...a,
    ...b,
    plugins: b.plugins ?? a.plugins
  };
}

