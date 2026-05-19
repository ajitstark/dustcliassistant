import { loadEnv } from "../utils/env.js";
import { startAnalysisWorker } from "./analysisWorker.js";
import { startReportWorker } from "./reportWorker.js";
import { startMemoryIndexWorker } from "./memoryIndexWorker.js";

loadEnv();

startAnalysisWorker();
startReportWorker();
startMemoryIndexWorker();

// Keep process alive
process.stdin.resume();
