export type Severity = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL" | "UNKNOWN";

export type StackFrame = {
  raw: string;
  file?: string;
  line?: number;
  column?: number;
  fn?: string;
};

export type ParsedLogEvent = {
  sourcePath?: string;
  timestamp?: string;
  severity: Severity;
  service?: string;
  message: string;
  stack?: {
    frames: StackFrame[];
    raw: string;
  };
  tags: string[];
  raw: string;
};

export type ErrorGroup = {
  signature: string;
  title: string;
  severity: Severity;
  count: number;
  sample: ParsedLogEvent;
  occurrences: Array<{
    sourcePath?: string;
    timestamp?: string;
  }>;
};

