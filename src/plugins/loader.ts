import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import type { DevAssistantPlugin } from "./types.js";

export async function loadPlugins(pluginPaths: string[]): Promise<DevAssistantPlugin[]> {
  const loaded: DevAssistantPlugin[] = [];
  for (const p of pluginPaths) {
    try {
      const abs = resolve(process.cwd(), p);
      const mod = (await import(pathToFileURL(abs).href)) as any;
      const plugin = (mod.default ?? mod.plugin ?? mod) as DevAssistantPlugin;
      if (plugin?.name && Array.isArray(plugin.shellHints)) loaded.push(plugin);
    } catch {
      // best-effort plugins
    }
  }
  return loaded;
}

