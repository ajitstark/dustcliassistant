import type { AiChatProvider } from "../ai/provider.js";
import { ROOT_CAUSE_PROMPT } from "../prompts/rootCause.js";
import type { ErrorGroup } from "../types/log.js";

export class RootCauseAnalyzerAgent {
  constructor(private ai: AiChatProvider) {}

  async analyze(groups: ErrorGroup[]) {
    const context = buildContext(groups);
    return this.ai.generateInsight({ prompt: ROOT_CAUSE_PROMPT, context });
  }
}

function buildContext(groups: ErrorGroup[]) {
  const top = groups.slice(0, 8);
  return JSON.stringify(
    {
      errorGroups: top.map((g) => ({
        title: g.title,
        count: g.count,
        severity: g.severity,
        tags: g.sample.tags,
        topFrame: g.sample.stack?.frames[0],
        sampleMessage: g.sample.message.slice(0, 800),
        sampleStack: g.sample.stack?.raw?.slice(0, 1200)
      }))
    },
    null,
    2
  );
}

