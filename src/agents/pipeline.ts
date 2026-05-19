import type { AnalysisResult } from "../types/analysis.js";
import type { ParsedLogEvent } from "../types/log.js";
import type { AiChatProvider } from "../ai/provider.js";
import type { DevAssistantPlugin } from "../plugins/types.js";
import { PatternDetectorAgent } from "./patternDetector.js";
import { RootCauseAnalyzerAgent } from "./rootCauseAnalyzer.js";
import { ShellRecommendationAgent } from "./shellRecommender.js";

export class AnalysisPipeline {
  private pattern = new PatternDetectorAgent();
  private rootCause: RootCauseAnalyzerAgent;
  private shell: ShellRecommendationAgent;

  constructor(ai: AiChatProvider, plugins: DevAssistantPlugin[] = []) {
    this.rootCause = new RootCauseAnalyzerAgent(ai);
    this.shell = new ShellRecommendationAgent(plugins);
  }

  async run(args: { files: string[]; events: ParsedLogEvent[] }): Promise<AnalysisResult> {
    const groups = this.pattern.group(args.events);
    const insightDTO = groups.length ? await this.rootCause.analyze(groups) : undefined;
    return {
      totals: {
        files: args.files.length,
        events: args.events.length,
        errorGroups: groups.length
      },
      events: args.events,
      groups,
      insight: insightDTO
        ? {
            ...insightDTO,
            commands: [...insightDTO.commands, ...this.shell.recommend(groups)]
          }
        : undefined
    };
  }
}
