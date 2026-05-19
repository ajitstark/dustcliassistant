import type { ParsedLogEvent, Severity } from "../types/log.js";
import { extractStackFromLines, parseNodeStack } from "./stacktrace.js";

const SEVERITY_MAP: Record<string, Severity> = {
  debug: "DEBUG",
  info: "INFO",
  warn: "WARN",
  warning: "WARN",
  error: "ERROR",
  fatal: "FATAL"
};

const ISO_TS = /(?<ts>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)/;
const COMMON =
  /^(?<ts>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:[.,]\d{3})?)\s+(?<sev>[A-Z]+)\s+(?:\[(?<svc>[^\]]+)\]\s+)?(?<msg>.*)$/;

export function parseLogChunk(
  rawLines: string[],
  sourcePath?: string
): ParsedLogEvent | null {
  const raw = rawLines.join("\n");
  const { stackRaw, rest } = extractStackFromLines(rawLines);
  const text = rest.join("\n").trim() || raw.trim();

  // JSON log
  const first = rawLines[0]?.trim();
  if (first?.startsWith("{") && first.endsWith("}")) {
    try {
      const obj = JSON.parse(first) as Record<string, unknown>;
      const ts = typeof obj.time === "string" ? obj.time : typeof obj.timestamp === "string" ? obj.timestamp : undefined;
      const sevRaw = typeof obj.level === "string" ? obj.level : typeof obj.severity === "string" ? obj.severity : undefined;
      const severity = normalizeSeverity(sevRaw);
      const message =
        typeof obj.msg === "string"
          ? obj.msg
          : typeof obj.message === "string"
            ? obj.message
            : text;
      const service = typeof obj.service === "string" ? obj.service : undefined;
      return buildEvent({ sourcePath, timestamp: ts, severity, service, message, stackRaw, raw });
    } catch {
      // fall through
    }
  }

  const m = COMMON.exec(text);
  if (m?.groups) {
    const ts = m.groups.ts;
    const severity = normalizeSeverity(m.groups.sev);
    const service = m.groups.svc;
    const message = m.groups.msg ?? text;
    return buildEvent({ sourcePath, timestamp: ts, severity, service, message, stackRaw, raw });
  }

  const tsMatch = ISO_TS.exec(text);
  const timestamp = tsMatch?.groups?.ts;
  const severity = inferSeverity(text);
  return buildEvent({ sourcePath, timestamp, severity, message: text, stackRaw, raw });
}

function buildEvent(args: {
  sourcePath?: string;
  timestamp?: string;
  severity: Severity;
  service?: string;
  message: string;
  stackRaw?: string;
  raw: string;
}): ParsedLogEvent {
  const tags = detectTags(args.message + "\n" + (args.stackRaw ?? ""));
  const frames = args.stackRaw ? parseNodeStack(args.stackRaw) : [];
  return {
    sourcePath: args.sourcePath,
    timestamp: args.timestamp,
    severity: args.severity,
    service: args.service,
    message: args.message,
    stack: args.stackRaw
      ? {
          raw: args.stackRaw,
          frames
        }
      : undefined,
    tags,
    raw: args.raw
  };
}

function normalizeSeverity(sev?: string): Severity {
  if (!sev) return "UNKNOWN";
  const s = sev.toLowerCase();
  if (s in SEVERITY_MAP) return SEVERITY_MAP[s]!;
  if (sev.toUpperCase() in { DEBUG: 1, INFO: 1, WARN: 1, ERROR: 1, FATAL: 1 }) return sev.toUpperCase() as Severity;
  return "UNKNOWN";
}

function inferSeverity(text: string): Severity {
  const t = text.toLowerCase();
  if (t.includes("fatal")) return "FATAL";
  if (t.includes("error") || t.includes("exception") || t.includes("stacktrace")) return "ERROR";
  if (t.includes("warn")) return "WARN";
  if (t.includes("info")) return "INFO";
  if (t.includes("debug")) return "DEBUG";
  return "UNKNOWN";
}

function detectTags(text: string): string[] {
  const t = text.toLowerCase();
  const tags: string[] = [];
  if (t.includes("redis")) tags.push("redis");
  if (t.includes("mongo")) tags.push("mongodb");
  if (t.includes("postgres") || t.includes("psql")) tags.push("postgres");
  if (t.includes("docker")) tags.push("docker");
  if (t.includes("kubernetes") || t.includes("k8s")) tags.push("kubernetes");
  if (t.includes("nestjs")) tags.push("nestjs");
  if (t.includes("node:") || t.includes("node.js")) tags.push("node");
  if (t.includes("connection refused") || t.includes("econnrefused")) tags.push("conn_refused");
  if (t.includes("timeout") || t.includes("etimedout")) tags.push("timeout");
  return [...new Set(tags)];
}
