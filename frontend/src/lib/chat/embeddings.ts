export const EMBEDDING_DIMENSION = 1536;

export async function createEmbedding(input: string): Promise<number[] | null> {
  const provider = (process.env.CHAT_EMBEDDING_PROVIDER || "openrouter").toLowerCase();
  const text = input.trim();
  if (!text) return null;

  if (provider === "disabled") return null;

  if (provider === "openrouter") {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.CHAT_EMBEDDING_MODEL || "text-embedding-3-small";

    if (!apiKey) return null;

    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes",
      },
      body: JSON.stringify({
        model,
        input: text,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const embedding = data?.data?.[0]?.embedding;

    return Array.isArray(embedding) ? embedding : null;
  }

  return null;
}
