import type { ErrorGroup, ParsedLogEvent, Severity } from "../types/log.js";
import { sha1 } from "../utils/hash.js";

export function groupErrors(events: ParsedLogEvent[]): ErrorGroup[] {
  const map = new Map<string, ErrorGroup>();
  for (const ev of events) {
    if (ev.severity !== "ERROR" && ev.severity !== "FATAL") continue;
    const signature = buildSignature(ev);
    const existing = map.get(signature);
    if (!existing) {
      map.set(signature, {
        signature,
        title: buildTitle(ev),
        severity: ev.severity,
        count: 1,
        sample: ev,
        occurrences: [{ sourcePath: ev.sourcePath, timestamp: ev.timestamp }]
      });
      continue;
    }
    existing.count += 1;
    existing.severity = worst(existing.severity, ev.severity);
    existing.occurrences.push({ sourcePath: ev.sourcePath, timestamp: ev.timestamp });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

function worst(a: Severity, b: Severity): Severity {
  const rank: Record<Severity, number> = {
    UNKNOWN: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5
  };
  return rank[b] > rank[a] ? b : a;
}

function buildSignature(ev: ParsedLogEvent): string {
  const top = ev.stack?.frames[0];
  const key = [
    normalizeMessage(ev.message),
    top?.file ?? "",
    top?.line?.toString() ?? "",
    top?.fn ?? "",
    ev.tags.sort().join(",")
  ].join("|");
  return sha1(key);
}

function normalizeMessage(msg: string) {
  return msg
    .replace(/\b0x[0-9a-f]+\b/gi, "0x…")
    .replace(/\b\d+\b/g, "N")
    .slice(0, 500);
}

function buildTitle(ev: ParsedLogEvent): string {
  const firstLine = ev.message.split("\n")[0] ?? ev.message;
  return firstLine.trim().slice(0, 120) || "Error";
}
