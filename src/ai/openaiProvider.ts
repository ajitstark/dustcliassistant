import { ChatOpenAI } from "@langchain/openai";
import { DebugInsightSchema, type AiChatProvider } from "./provider.js";

export class OpenAiProvider implements AiChatProvider {
  private model: ChatOpenAI;

  constructor(args: { apiKey: string; model: string }) {
    this.model = new ChatOpenAI({
      apiKey: args.apiKey,
      model: args.model,
      temperature: 0.2
    });
  }

  async generateInsight(input: { prompt: string; context: string }) {
    try {
      const res = await this.model.invoke([
        {
          role: "system",
          content: input.prompt
        },
        {
          role: "user",
          content: input.context
        }
      ]);
      const text = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
      const json = safeJson(text);
      return DebugInsightSchema.parse(json);
    } catch (e) {
      const anyErr = e as any;
      const status = anyErr?.response?.status ?? anyErr?.status;
      const data = anyErr?.response?.data ?? anyErr?.data;
      const details =
        data && typeof data === "object" ? JSON.stringify(data) : data ? String(data) : undefined;

      const message = typeof anyErr?.message === "string" ? anyErr.message : "";
      if (status === 404 || message.includes(" 404") || message.includes("status code 404")) {
        const hint =
          "OpenAI returned 404. This usually means the model name is unavailable for your key, or the model doesn't support the Chat Completions endpoint. Try setting `OPENAI_MODEL=gpt-4o-mini` (or another chat-capable model) or set `AI_PROVIDER=gemini`.";
        throw new Error(details ? `${hint}\n${details}` : hint);
      }
      throw e;
    }
  }
}

function safeJson(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
  throw new Error("AI provider returned non-JSON output");
}
