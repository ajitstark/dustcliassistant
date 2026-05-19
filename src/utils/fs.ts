import { createReadStream, promises as fsp } from "node:fs";
import { stat } from "node:fs/promises";
import { basename, join } from "node:path";
import { createInterface } from "node:readline";

const SUPPORTED_EXT = new Set([".log", ".txt", ".json", ".ndjson"]);

export async function isDirectory(path: string) {
  return (await stat(path)).isDirectory();
}

export async function listFilesRecursive(root: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (SUPPORTED_EXT.has(extnameSafe(e.name))) out.push(full);
    }
  }
  if (await isDirectory(root)) await walk(root);
  else out.push(root);
  return out;
}

function extnameSafe(name: string) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i);
}

export async function streamLines(
  filePath: string,
  onLine: (line: string) => void | Promise<void>,
  opts?: { maxLines?: number }
) {
  const rs = createReadStream(filePath, { encoding: "utf8" });
  const rl = createInterface({ input: rs, crlfDelay: Infinity });
  let seen = 0;
  for await (const line of rl) {
    await onLine(line);
    seen += 1;
    if (opts?.maxLines && seen >= opts.maxLines) break;
  }
  rl.close();
  rs.close();
}

export function fileLabel(path?: string) {
  if (!path) return "stdin";
  return basename(path);
}

