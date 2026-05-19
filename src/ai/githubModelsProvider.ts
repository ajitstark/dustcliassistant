import axios from "axios";
import { DebugInsightSchema, type AiChatProvider } from "./provider.js";

export class GitHubModelsProvider implements AiChatProvider {
  constructor(
    private args: {
      token: string;
      model: string;
      org?: string;
      apiVersion?: string;
    }
  ) {}

  async generateInsight(input: { prompt: string; context: string }) {
    const url = this.args.org
      ? `https://models.github.ai/orgs/${encodeURIComponent(this.args.org)}/inference/chat/completions`
      : "https://models.github.ai/inference/chat/completions";

    try {
      const res = await axios.post(
        url,
        {
          model: this.args.model,
          messages: [
            { role: "system", content: input.prompt },
            { role: "user", content: input.context }
          ],
          temperature: 0.2
        },
        {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${this.args.token}`,
            "X-GitHub-Api-Version": this.args.apiVersion ?? "2026-03-10",
            "Content-Type": "application/json"
          },
          timeout: 60_000
        }
      );

      const content = String(res.data?.choices?.[0]?.message?.content ?? "");
      const json = safeJson(content);
      return DebugInsightSchema.parse(json);
    } catch (e) {
      const anyErr = e as any;
      const status = anyErr?.response?.status ?? anyErr?.status;
      const data = anyErr?.response?.data ?? anyErr?.data;
      const details =
        data && typeof data === "object" ? JSON.stringify(data) : data ? String(data) : undefined;

      const hint =
        `GitHub Models request failed` +
        (status ? ` with HTTP ${status}` : "") +
        `. Check that your token has the \`models:read\` scope (or fine-grained PAT permission for Models).`;
      throw new Error(details ? `${hint}\n${details}` : hint);
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

