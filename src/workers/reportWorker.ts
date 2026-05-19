import { Worker } from "bullmq";
import { reportQueue } from "../queues/queues.js";
import { getRedis } from "../queues/redis.js";
import { ingestPaths } from "../services/ingestion.js";
import { AnalysisPipeline } from "../agents/pipeline.js";
import { logger } from "../utils/logger.js";
import { ReportJobSchema } from "../queues/jobTypes.js";
import { renderMarkdownReport } from "../services/report.js";
import { writeFile } from "node:fs/promises";
import { createChatProvider } from "../ai/factory.js";

export function startReportWorker() {
  const connection = getRedis();
  const worker = new Worker(
    reportQueue.name,
    async (job) => {
      const payload = ReportJobSchema.parse(job.data);
      const { files, events } = await ingestPaths(payload.paths, { maxLinesPerFile: 50000 });
      const pipeline = new AnalysisPipeline(createChatProvider());
      const result = await pipeline.run({ files, events });
      const md = renderMarkdownReport(result);
      await writeFile(payload.outFile, md, "utf8");
      return { outFile: payload.outFile };
    },
    { connection, concurrency: 1 }
  );
  worker.on("completed", (job) => logger.info({ jobId: job.id }, "report job completed"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "report job failed"));
  return worker;
}
