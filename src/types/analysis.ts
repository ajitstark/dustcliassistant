import type { ErrorGroup, ParsedLogEvent } from "./log.js";

export type AnalysisInput = {
  paths: string[];
  maxLinesPerFile?: number;
};

export type DebugInsight = {
  likelyIssue: string;
  confidence: number; // 0..100
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  suggestions: string[];
  commands: string[];
  bugSummary: string;
};

export type AnalysisResult = {
  totals: {
    files: number;
    events: number;
    errorGroups: number;
  };
  events: ParsedLogEvent[];
  groups: ErrorGroup[];
  insight?: DebugInsight;
  reportMarkdown?: string;
};

