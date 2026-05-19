import { Queue } from "bullmq";
import { getRedis } from "./redis.js";

export const analysisQueue = new Queue("analysis", { connection: getRedis() });
export const embeddingQueue = new Queue("embeddings", { connection: getRedis() });
export const reportQueue = new Queue("reports", { connection: getRedis() });
export const memoryIndexQueue = new Queue("memory_index", { connection: getRedis() });

