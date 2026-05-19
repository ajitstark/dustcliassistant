import { z } from "zod";

export const DebugInsightSchema = z.object({
  likelyIssue: z.string().min(1),
  confidence: z.number().int().min(0).max(100),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  suggestions: z.array(z.string().min(1)).min(1),
  commands: z.array(z.string().min(1)).min(1),
  bugSummary: z.string().min(1)
});

export type DebugInsightDTO = z.infer<typeof DebugInsightSchema>;

export interface AiChatProvider {
  generateInsight(input: { prompt: string; context: string }): Promise<DebugInsightDTO>;
}

