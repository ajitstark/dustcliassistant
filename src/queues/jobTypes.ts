import { z } from "zod";

export const AnalysisJobSchema = z.object({
  paths: z.array(z.string()).min(1),
  maxLinesPerFile: z.number().int().positive().optional()
});

export const ReportJobSchema = z.object({
  paths: z.array(z.string()).min(1),
  outFile: z.string().min(1)
});

export const MemoryIndexJobSchema = z.object({
  error: z.string().min(1),
  fix: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export type AnalysisJob = z.infer<typeof AnalysisJobSchema>;
export type ReportJob = z.infer<typeof ReportJobSchema>;
export type MemoryIndexJob = z.infer<typeof MemoryIndexJobSchema>;

