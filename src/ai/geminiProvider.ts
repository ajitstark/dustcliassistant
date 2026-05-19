import axios from "axios";
import { DebugInsightSchema, type AiChatProvider } from "./provider.js";

export class GeminiProvider implements AiChatProvider {
  constructor(private args: { apiKey: string; model: string }) {}

  async generateInsight(input: { prompt: string; context: string }) {
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                `${input.prompt}\n\n` +
                `CONTEXT:\n${input.context}\n\n` +
                `Return STRICT JSON only.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2
      }
    };

    const post = (model: string) =>
      axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model
        )}:generateContent`,
        payload,
        {
          params: { key: this.args.apiKey },
          timeout: 60_000
        }
      );

    let res;
    try {
      res = await post(this.args.model);
    } catch (e) {
      const anyErr = e as any;
      const status = anyErr?.response?.status ?? anyErr?.status;
      const data = anyErr?.response?.data ?? anyErr?.data;
      const details =
        data && typeof data === "object" ? JSON.stringify(data) : data ? String(data) : undefined;

      if (status === 404) {
        const fallbackModel = guessFallbackModel(this.args.model);
        if (fallbackModel) {
          try {
            res = await post(fallbackModel);
          } catch {
            // fall through to helpful error below
          }
        }
        const hint =
          `Gemini returned 404 for model "${this.args.model}". ` +
          "This usually means the model name is invalid or not enabled for your API key. " +
          "Update `GEMINI_MODEL` in `.env` to a valid Gemini model for the Generative Language API (AI Studio), or switch to OpenAI by setting `AI_PROVIDER=openai`.";
        throw new Error(details ? `${hint}\n${details}` : hint);
      }
      if (status === 503) {
        const hint =
          "Gemini returned 503 (service unavailable). This is usually a transient outage/throttling event, or your key/project is temporarily blocked from serving. Retry in a minute; if it persists, check Google AI Studio / Cloud quotas & billing, and verify the key works with a direct curl call.";
        throw new Error(details ? `${hint}\n${details}` : hint);
      }
      if (typeof status === "number") {
        const hint = `Gemini request failed with HTTP ${status}.`;
        throw new Error(details ? `${hint}\n${details}` : hint);
      }
      throw e;
    }

    const text = String(
      res.data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? ""
    );
    const json = safeJson(text);
    return DebugInsightSchema.parse(json);
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

function guessFallbackModel(model: string): string | undefined {
  // Common aliases seen in configs/docs. If the exact name 404s, try the -latest variant once.
  if (model === "gemini-1.5-pro") return "gemini-1.5-pro-latest";
  if (model === "gemini-1.5-flash") return "gemini-1.5-flash-latest";
  return undefined;
}
