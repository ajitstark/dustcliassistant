import type { AiChatProvider } from "./provider.js";
import { env } from "../utils/env.js";
import { OpenAiProvider } from "./openaiProvider.js";
import { GeminiProvider } from "./geminiProvider.js";
import { GitHubModelsProvider } from "./githubModelsProvider.js";

export type ProviderName = "openai" | "gemini" | "github";

export function getProviderName(): ProviderName {
  const p = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
  if (p === "openai" || p === "gemini" || p === "github") return p;
  throw new Error(`Unsupported AI_PROVIDER: ${p}`);
}

export function createChatProvider(): AiChatProvider {
  const p = getProviderName();
  if (p === "openai") {
    return new OpenAiProvider({
      apiKey: env("OPENAI_API_KEY"),
      model: env("OPENAI_MODEL", "gpt-4.1-mini")
    });
  }
  if (p === "gemini") {
    return new GeminiProvider({
      apiKey: env("GEMINI_API_KEY"),
      model: env("GEMINI_MODEL", "gemini-2.5-flash")
    });
  }
  return new GitHubModelsProvider({
    token: env("GITHUB_MODELS_TOKEN"),
    model: env("GITHUB_MODELS_MODEL", "openai/gpt-4.1"),
    org: process.env.GITHUB_MODELS_ORG,
    apiVersion: process.env.GITHUB_API_VERSION
  });
}
