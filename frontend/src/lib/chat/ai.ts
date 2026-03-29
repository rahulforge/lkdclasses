import { buildContext } from "@/lib/chat/rag";
import type { RetrievedDocument } from "@/lib/chat/types";

const STRICT_SYSTEM_PROMPT = `You are a coaching institute support assistant.
Answer ONLY from the provided context.
If the answer is not explicitly present in the context, reply exactly: Please contact institute
Do not guess.
Do not add outside knowledge.
Keep the answer short, factual, and user-friendly.
You may answer in English or Hinglish based on the user's language.`;

export async function generateStrictAnswer(
  query: string,
  documents: RetrievedDocument[]
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.CHAT_COMPLETION_MODEL || "openai/gpt-4o-mini";

  if (!apiKey || documents.length === 0) return null;

  const context = buildContext(documents);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        { role: "system", content: STRICT_SYSTEM_PROMPT },
        {
          role: "user",
          content: `User query: ${query}\n\nContext:\n${context}`,
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const answer = data?.choices?.[0]?.message?.content;

  if (typeof answer !== "string" || !answer.trim()) return null;

  return answer.trim();
}
