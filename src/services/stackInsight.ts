import type { ParsedLogEvent, StackFrame } from "../types/log.js";

export function summarizeStack(ev: ParsedLogEvent) {
  const frames = ev.stack?.frames ?? [];
  if (!frames.length) return null;
  const app = frames.find((f) => f.file && !f.file.includes("node_modules")) ?? frames[0]!;
  return {
    probableSource: formatFrame(app),
    callChain: frames.slice(0, 8).map(formatFrame).filter(Boolean)
  };
}

function formatFrame(f: StackFrame): string | null {
  if (!f.file) return null;
  const loc = `${f.file}:${f.line ?? "?"}:${f.column ?? "?"}`;
  return f.fn ? `${f.fn.trim()} (${loc})` : loc;
}

