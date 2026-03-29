import { createEmbedding } from "@/lib/chat/embeddings";
import { callSupabaseRpc, fetchSupabaseTable } from "@/lib/chat/supabase-server";
import type { RetrievedDocument } from "@/lib/chat/types";

type DocumentRow = {
  id: string;
  title?: string | null;
  category?: string | null;
  content?: string | null;
  source?: string | null;
  similarity?: number | null;
};

function toSafeDocuments(rows: DocumentRow[]): RetrievedDocument[] {
  return rows.slice(0, 3).map((row) => ({
    id: String(row.id),
    title: String(row.title ?? "Untitled"),
    category: String(row.category ?? "general"),
    content: String(row.content ?? ""),
    source: row.source ?? null,
    similarity: typeof row.similarity === "number" ? row.similarity : null,
  }));
}

export async function retrieveDocuments(query: string): Promise<RetrievedDocument[]> {
  const embedding = await createEmbedding(query);

  if (embedding) {
    try {
      const rows = await callSupabaseRpc<DocumentRow[]>("match_documents", {
        query_embedding: embedding,
        match_count: 3,
      });

      return toSafeDocuments(rows || []);
    } catch {
      // fall through to keyword retrieval
    }
  }

  const normalized = query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!normalized) return [];

  const rows = await fetchSupabaseTable<DocumentRow[]>(
    "documents",
    `select=id,title,category,content,source&or=(title.ilike.*${encodeURIComponent(normalized)}*,content.ilike.*${encodeURIComponent(normalized)}*)&limit=3`
  ).catch(() => []);

  return toSafeDocuments(rows || []);
}

export function buildContext(documents: RetrievedDocument[]) {
  return documents
    .slice(0, 3)
    .map((doc, index) => `Document ${index + 1}:\nTitle: ${doc.title}\nCategory: ${doc.category}\nContent: ${doc.content}`)
    .join("\n\n");
}
