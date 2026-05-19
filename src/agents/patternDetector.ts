import type { ParsedLogEvent } from "../types/log.js";
import { groupErrors } from "../services/grouping.js";

export class PatternDetectorAgent {
  group(events: ParsedLogEvent[]) {
    return groupErrors(events);
  }
}

