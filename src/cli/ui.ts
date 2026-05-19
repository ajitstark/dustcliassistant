import boxen from "boxen";
import chalk from "chalk";

export function renderInsightBox(input: {
  problem: string;
  severity: string;
  confidence: number;
  fixes: string[];
  commands: string[];
}) {
  const body = [
    `${chalk.bold("Problem:")} ${input.problem}`,
    "",
    `${chalk.bold("Severity:")} ${colorSeverity(input.severity)}`,
    `${chalk.bold("Confidence:")} ${input.confidence}%`,
    "",
    `${chalk.bold("Suggested Fixes:")}`,
    ...input.fixes.map((f) => `✓ ${f}`),
    "",
    `${chalk.bold("Commands:")}`,
    ...input.commands
  ].join("\n");

  return boxen(body, {
    padding: 1,
    borderStyle: "round",
    borderColor: "cyan"
  });
}

function colorSeverity(sev: string) {
  switch (sev) {
    case "CRITICAL":
      return chalk.redBright(sev);
    case "HIGH":
      return chalk.red(sev);
    case "MEDIUM":
      return chalk.yellow(sev);
    default:
      return chalk.green(sev);
  }
}

