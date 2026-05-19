import type { DevAssistantPlugin } from "../plugins/types.js";
import type { ErrorGroup } from "../types/log.js";
import { recommendShellCommands } from "../services/shellRecs.js";

export class ShellRecommendationAgent {
  constructor(private plugins: DevAssistantPlugin[]) {}
  recommend(groups: ErrorGroup[]) {
    return recommendShellCommands(groups, this.plugins);
  }
}

