import { isDirectory, listFilesRecursive, streamLines } from "../utils/fs.js";
import type { ParsedLogEvent } from "../types/log.js";
import { parseLogChunk } from "../parsers/logParser.js";

// Heuristic: group multiline errors by blank lines or stack frame start.
export async function ingestPaths(
  paths: string[],
  opts?: { maxLinesPerFile?: number }
): Promise<{ files: string[]; events: ParsedLogEvent[] }> {
  const files: string[] = [];
  for (const p of paths) {
    if (await isDirectory(p)) files.push(...(await listFilesRecursive(p)));
    else files.push(p);
  }

  const events: ParsedLogEvent[] = [];
  for (const filePath of files) {
    let buf: string[] = [];
    const flush = () => {
      if (buf.length === 0) return;
      const ev = parseLogChunk(buf, filePath);
      if (ev) events.push(ev);
      buf = [];
    };

    await streamLines(
      filePath,
      (line) => {
        const isBoundary = line.trim() === "";
        const looksLikeNewEvent =
          /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(line) ||
          line.trim().startsWith("{") ||
          /^[A-Z]{3,6}\b/.test(line);
        if (isBoundary || (looksLikeNewEvent && buf.length > 0)) flush();
        if (!isBoundary) buf.push(line);
      },
      { maxLines: opts?.maxLinesPerFile }
    );
    flush();
  }

  return { files, events };
}
