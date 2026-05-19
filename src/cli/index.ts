import { Command } from "commander";
import chalk from "chalk";
import { loadEnv } from "../utils/env.js";
import { registerAnalyze } from "../commands/analyze.js";
import { registerInspect } from "../commands/inspect.js";
import { registerExplain } from "../commands/explain.js";
import { registerReport } from "../commands/report.js";
import { registerAsk } from "../commands/ask.js";
import { registerSuggest } from "../commands/suggest.js";
import { registerLive } from "../commands/live.js";
import { registerFix } from "../commands/fix.js";
import { registerSysinfo } from "../commands/sysinfo.js";

loadEnv();

const program = new Command();

program.name("dev-assistant").description("AI-powered debugging CLI assistant").version("0.1.0");

registerAnalyze(program);
registerInspect(program);
registerExplain(program);
registerReport(program);
registerAsk(program);
registerSuggest(program);
registerLive(program);
registerFix(program);
registerSysinfo(program);

program.parseAsync(process.argv).catch((e) => {
  console.error(chalk.red(e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
