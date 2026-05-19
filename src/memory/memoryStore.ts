import { getPrisma } from "../db/prisma.js";
import { getChromaClient } from "../embeddings/chroma.js";
import { env, envBool } from "../utils/env.js";
import { sha1 } from "../utils/hash.js";
import { embedText } from "../embeddings/embedder.js";

export type MemoryRecord = {
  error: string;
  fix?: string;
  notes?: string;
  tags?: string[];
  embedding?: number[];
};

export class MemoryStore {
  async upsert(record: MemoryRecord) {
    const prisma = getPrisma();
    const vectorId = sha1(`${record.error}\n${record.fix ?? ""}\n${record.notes ?? ""}`);
    await prisma.memoryEntry.upsert({
      where: { vectorId },
      update: {
        error: record.error,
        fix: record.fix,
        notes: record.notes,
        tags: record.tags ?? []
      },
      create: {
        error: record.error,
        fix: record.fix,
        notes: record.notes,
        tags: record.tags ?? [],
        vectorId
      }
    });

    const shouldEmbed = envBool("ENABLE_EMBEDDINGS", "true");
    const embedding =
      record.embedding && record.embedding.length > 0
        ? record.embedding
        : shouldEmbed
          ? await embedText(`${record.error}\n${record.fix ?? ""}\n${record.notes ?? ""}`)
          : undefined;

    if (embedding && embedding.length > 0) {
      const chroma = getChromaClient();
      const col = await chroma.getOrCreateCollection({ name: env("CHROMA_COLLECTION") });
      await col.upsert({
        ids: [vectorId],
        embeddings: [embedding],
        documents: [record.error],
        metadatas: [
          {
            fix: record.fix ?? "",
            notes: record.notes ?? "",
            tags: (record.tags ?? []).join(",")
          }
        ]
      });
    }

    return vectorId;
  }

  async query(args: { embedding: number[]; n?: number }) {
    const chroma = getChromaClient();
    const col = await chroma.getOrCreateCollection({ name: env("CHROMA_COLLECTION") });
    const res = await col.query({
      queryEmbeddings: [args.embedding],
      nResults: args.n ?? 5
    });
    const hits: Array<{ id: string; document?: string; metadata?: Record<string, unknown> }> = [];
    const ids = res.ids?.[0] ?? [];
    const docs = res.documents?.[0] ?? [];
    const metas = res.metadatas?.[0] ?? [];
    for (let i = 0; i < ids.length; i++) {
      hits.push({ id: ids[i]!, document: docs[i] as string | undefined, metadata: metas[i] as any });
    }
    return hits;
  }
}
