import { Worker } from "bullmq";
import { analysisQueue } from "../queues/queues.js";
import { getRedis } from "../queues/redis.js";
import { ingestPaths } from "../services/ingestion.js";
import { AnalysisPipeline } from "../agents/pipeline.js";
import { logger } from "../utils/logger.js";
import { AnalysisJobSchema } from "../queues/jobTypes.js";
import { createChatProvider } from "../ai/factory.js";

export function startAnalysisWorker() {
  const connection = getRedis();
  const worker = new Worker(
    analysisQueue.name,
    async (job) => {
      const payload = AnalysisJobSchema.parse(job.data);
      const { files, events } = await ingestPaths(payload.paths, {
        maxLinesPerFile: payload.maxLinesPerFile
      });
      const pipeline = new AnalysisPipeline(createChatProvider());
      return pipeline.run({ files, events });
    },
    {
      connection,
      concurrency: 2
    }
  );

  worker.on("completed", (job) => logger.info({ jobId: job.id }, "analysis job completed"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "analysis job failed"));
  return worker;
}
