import fs from "node:fs/promises";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const EMBEDDING_MODEL = process.env.CHAT_EMBEDDING_MODEL || "text-embedding-3-small";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

if (!OPENROUTER_API_KEY) {
  throw new Error("Missing OPENROUTER_API_KEY");
}

async function fetchDocuments() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/documents?select=id,title,content&limit=500`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch documents: ${await response.text()}`);
  }

  return response.json();
}

async function createEmbedding(text) {
  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding request failed: ${await response.text()}`);
  }

  const data = await response.json();
  return data?.data?.[0]?.embedding;
}

async function updateDocument(id, embedding) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/documents?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ embedding }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update ${id}: ${await response.text()}`);
  }
}

const documents = await fetchDocuments();

for (const doc of documents) {
  const text = `${doc.title}\n\n${doc.content}`;
  const embedding = await createEmbedding(text);

  if (!Array.isArray(embedding)) {
    throw new Error(`Invalid embedding for document ${doc.id}`);
  }

  await updateDocument(doc.id, embedding);
  console.log(`Synced embedding for ${doc.id}`);
}

await fs.mkdir("./tmp", { recursive: true });
await fs.writeFile("./tmp/chatbot-embedding-sync.json", JSON.stringify({ synced: documents.length }, null, 2));
console.log(`Done. Synced ${documents.length} documents.`);
