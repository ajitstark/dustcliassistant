import { analysisQueue, memoryIndexQueue, reportQueue } from "./queues.js";
import type { AnalysisJob, MemoryIndexJob, ReportJob } from "./jobTypes.js";

const defaultOpts = {
  attempts: 5,
  backoff: { type: "exponential" as const, delay: 1000 },
  removeOnComplete: 50,
  removeOnFail: 200
};

export async function enqueueAnalysis(job: AnalysisJob) {
  return analysisQueue.add("analyze", job, defaultOpts);
}

export async function enqueueReport(job: ReportJob) {
  return reportQueue.add("report", job, defaultOpts);
}

export async function enqueueMemoryIndex(job: MemoryIndexJob) {
  return memoryIndexQueue.add("index", job, defaultOpts);
}

