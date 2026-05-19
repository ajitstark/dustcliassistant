import type { ParsedLogEvent } from "../types/log.js";

export type ErrorCategory =
  | "redis"
  | "postgres"
  | "mongodb"
  | "docker"
  | "kubernetes"
  | "node"
  | "network"
  | "unknown";

export class ErrorClassifierAgent {
  classify(event: ParsedLogEvent): ErrorCategory {
    const tags = new Set(event.tags.map((t) => t.toLowerCase()));
    if (tags.has("redis")) return "redis";
    if (tags.has("postgres")) return "postgres";
    if (tags.has("mongodb")) return "mongodb";
    if (tags.has("docker")) return "docker";
    if (tags.has("kubernetes")) return "kubernetes";
    if (tags.has("node")) return "node";
    if (tags.has("timeout") || tags.has("conn_refused")) return "network";
    return "unknown";
  }
}

