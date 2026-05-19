import type { DevAssistantPlugin } from "../plugins/types.js";
import type { ErrorGroup } from "../types/log.js";

export function recommendShellCommands(groups: ErrorGroup[], plugins: DevAssistantPlugin[]) {
  const tags = new Set(groups.flatMap((g) => g.sample.tags));
  const messages = groups.map((g) => g.sample.message.toLowerCase()).join("\n");
  const cmds: string[] = [];

  // baseline heuristics
  if (tags.has("redis")) cmds.push("redis-cli ping", "lsof -i:6379");
  if (tags.has("postgres")) cmds.push("pg_isready", "lsof -i:5432");
  if (tags.has("docker")) cmds.push("docker ps", "docker logs <container>");
  if (tags.has("timeout")) cmds.push("curl -v http://localhost:<port>", "netstat -an | head");

  for (const plugin of plugins) {
    for (const hint of plugin.shellHints) {
      const okTags =
        !hint.whenTagsAny || hint.whenTagsAny.some((t) => tags.has(t.toLowerCase()));
      const okMsg =
        !hint.whenMessageIncludes ||
        hint.whenMessageIncludes.some((s) => messages.includes(s.toLowerCase()));
      if (okTags && okMsg) cmds.push(...hint.commands);
    }
  }

  return dedupe(cmds).slice(0, 12);
}

function dedupe(items: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const i of items) {
    const k = i.trim();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

