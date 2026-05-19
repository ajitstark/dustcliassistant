import { Worker } from "bullmq";
import { memoryIndexQueue } from "../queues/queues.js";
import { getRedis } from "../queues/redis.js";
import { logger } from "../utils/logger.js";
import { MemoryStore } from "../memory/memoryStore.js";
import { MemoryIndexJobSchema } from "../queues/jobTypes.js";

export function startMemoryIndexWorker() {
  const connection = getRedis();
  const worker = new Worker(
    memoryIndexQueue.name,
    async (job) => {
      const payload = MemoryIndexJobSchema.parse(job.data);
      const store = new MemoryStore();
      return store.upsert(payload);
    },
    { connection, concurrency: 2 }
  );
  worker.on("completed", (job) => logger.info({ jobId: job.id }, "memory index job completed"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "memory index job failed"));
  return worker;
}

