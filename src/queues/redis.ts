import Redis from "ioredis";
import { env } from "../utils/env.js";

let redis: Redis | undefined;

export function getRedis() {
  redis ??= new Redis(env("REDIS_URL"));
  return redis;
}
