import type { AnalysisResult } from "../types/analysis.js";

export function renderMarkdownReport(result: AnalysisResult) {
  const i = result.insight;
  const lines: string[] = [];
  lines.push("# Bug Report");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(i ? i.likelyIssue : "No critical errors detected.");
  lines.push("");
  lines.push("## Root Cause");
  lines.push("");
  lines.push(i ? i.bugSummary : "Insufficient signal in provided logs.");
  lines.push("");
  lines.push("## Severity");
  lines.push("");
  lines.push(i ? i.severity : "LOW");
  lines.push("");
  lines.push("## Suggested Fixes");
  lines.push("");
  for (const s of i?.suggestions ?? []) lines.push(`- ${s}`);
  if (!i?.suggestions?.length) lines.push("- N/A");
  lines.push("");
  lines.push("## Recommended Commands");
  lines.push("");
  for (const c of i?.commands ?? []) lines.push("```bash\n" + c + "\n```");
  if (!i?.commands?.length) lines.push("```bash\n# N/A\n```");
  lines.push("");
  lines.push("## Affected Areas");
  lines.push("");
  for (const g of result.groups.slice(0, 10)) {
    const loc = g.sample.stack?.frames[0];
    lines.push(
      `- ${g.title} (x${g.count})${loc?.file ? ` — ${loc.file}:${loc.line ?? "?"}` : ""}`
    );
  }
  if (!result.groups.length) lines.push("- N/A");
  lines.push("");
  return lines.join("\n");
}
