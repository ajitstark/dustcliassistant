import { ChromaClient } from "chromadb";
import { env } from "../utils/env.js";

export function getChromaClient() {
  return new ChromaClient({ path: env("CHROMA_URL") });
}
