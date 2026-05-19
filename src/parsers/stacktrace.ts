import type { StackFrame } from "../types/log.js";

const NODE_FRAME =
  /^\s*at\s+(?:(?<fn>[^()]+)\s+\()?(?<file>[^():]+):(?<line>\d+):(?<col>\d+)\)?\s*$/;

export function parseNodeStack(stackRaw: string): StackFrame[] {
  const frames: StackFrame[] = [];
  const lines = stackRaw.split("\n");
  for (const line of lines) {
    const m = NODE_FRAME.exec(line);
    if (!m?.groups) continue;
    frames.push({
      raw: line,
      fn: m.groups.fn?.trim(),
      file: m.groups.file,
      line: Number(m.groups.line),
      column: Number(m.groups.col)
    });
  }
  return frames;
}

export function extractStackFromLines(lines: string[]): { stackRaw?: string; rest: string[] } {
  const idx = lines.findIndex((l) => l.includes("at ") || l.trim().startsWith("at "));
  if (idx === -1) return { rest: lines };
  const stackLines: string[] = [];
  for (let i = idx; i < lines.length; i++) {
    const l = lines[i];
    if (l.trim() === "") break;
    stackLines.push(l);
    if (!l.includes(" at ") && !l.trim().startsWith("at ")) break;
  }
  const rest = [...lines.slice(0, idx), ...lines.slice(idx + stackLines.length)];
  return { stackRaw: stackLines.join("\n"), rest };
}
