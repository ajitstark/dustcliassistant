import { OpenAIEmbeddings } from "@langchain/openai";
import { env } from "../utils/env.js";
import { getProviderName } from "../ai/factory.js";
import axios from "axios";

type Embedder = {
  embedQuery: (text: string) => Promise<number[]>;
};

let embedder: Embedder | undefined;

export function getEmbedder() {
  const provider = getProviderName();
  if (!embedder) {
    embedder =
      provider === "openai"
        ? new OpenAIEmbeddings({
            apiKey: env("OPENAI_API_KEY"),
            model: env("OPENAI_EMBED_MODEL", "text-embedding-3-small")
          })
        : {
            embedQuery: async (text: string) => embedGemini(text)
          };
  }
  return embedder;
}

async function embedGemini(text: string): Promise<number[]> {
  const apiKey = env("GEMINI_API_KEY");
  const model = env("GEMINI_EMBED_MODEL", "text-embedding-004");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:embedContent`;
  const res = await axios.post(
    url,
    { content: { parts: [{ text }] } },
    { params: { key: apiKey }, timeout: 60_000 }
  );
  const values = res.data?.embedding?.values;
  if (!Array.isArray(values) || values.length === 0) throw new Error("Gemini embeddings failed");
  return values as number[];
}

export async function embedText(text: string): Promise<number[]> {
  const e = getEmbedder();
  return e.embedQuery(text);
}
