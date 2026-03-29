import { detectIntent, normalizeChatQuery } from "@/lib/chat/intent";
import { generateStrictAnswer } from "@/lib/chat/ai";
import { extractClassFromQuery, getQuickSuggestions, getRuleAnswer } from "@/lib/chat/knowledge";
import { expandQueryVariants } from "@/lib/chat/kb";
import { retrieveDocuments } from "@/lib/chat/rag";
import { getServerCache, setServerCache } from "@/lib/chat/server-cache";
import type { ChatIntent, ChatResponsePayload } from "@/lib/chat/types";

const CHAT_CACHE_TTL_MS = 5 * 60 * 1000;
const CHAT_CACHE_VERSION = "v3";

function shouldUseDirectRule(intent: ChatIntent) {
  return intent !== "unknown";
}

function getClarification(query: string, intent: ChatIntent): ChatResponsePayload | null {
  const text = query.toLowerCase();

  if (intent === "fees") {
    const className = extractClassFromQuery(query);
    if (!className) {
      return {
        answer: "Aap kis class ki fee puchh rahe hain? Example: Class 10, Class 11, Class 12 ya Competition.",
        source: "clarification",
        intent,
        needsClarification: true,
        clarificationKey: "class",
        suggestions: ["Class 10 fee", "Class 11 fee", "Competition fee"],
      };
    }
  }

  if (intent === "results") {
    const asksWhen = ["kab", "when", "aayega", "aaega"].some((item) => text.includes(item));
    const asksType = !text.includes("tse") && !text.includes("result link") && !text.includes("certificate");
    if (!asksWhen && asksType) {
      return {
        answer: "Aapko result link chahiye, TSE result dekhna hai, ya certificate download karna hai?",
        source: "clarification",
        intent,
        needsClarification: true,
        clarificationKey: "result-type",
        suggestions: ["Result link", "TSE result", "Certificate"],
      };
    }
  }

  return null;
}

export async function getChatResponse(query: string): Promise<ChatResponsePayload> {
  const normalized = normalizeChatQuery(query);
  const cacheKey = `chat:${CHAT_CACHE_VERSION}:${normalized}`;
  const cached = getServerCache<ChatResponsePayload>(cacheKey);
  if (cached) return { ...cached, cached: true };

  const rule = detectIntent(query);
  const clarification = getClarification(query, rule.intent);
  if (clarification) {
    setServerCache(cacheKey, clarification, CHAT_CACHE_TTL_MS);
    return clarification;
  }

  const suggestions = getQuickSuggestions(rule.intent);

  if (shouldUseDirectRule(rule.intent) && rule.score > 0) {
    const directRuleAnswer = getRuleAnswer(rule.intent, query);
    if (directRuleAnswer) {
      const payload: ChatResponsePayload = {
        answer: directRuleAnswer,
        source: "rule",
        intent: rule.intent,
        suggestions,
      };
      setServerCache(cacheKey, payload, CHAT_CACHE_TTL_MS);
      return payload;
    }
  }

  const expandedQueries = expandQueryVariants(query);
  for (const expanded of expandedQueries) {
    const documents = await retrieveDocuments(expanded);
    if (documents.length > 0) {
      const aiAnswer = await generateStrictAnswer(expanded, documents);
      if (aiAnswer) {
        const payload: ChatResponsePayload = {
          answer: aiAnswer,
          source: "rag",
          intent: rule.intent,
          suggestions,
          documents,
        };
        setServerCache(cacheKey, payload, CHAT_CACHE_TTL_MS);
        return payload;
      }

      const payload: ChatResponsePayload = {
        answer: documents[0].content,
        source: "database",
        intent: rule.intent,
        suggestions,
        documents,
      };
      setServerCache(cacheKey, payload, CHAT_CACHE_TTL_MS);
      return payload;
    }
  }

  const fallback: ChatResponsePayload = {
    answer: `For direct help, call ${process.env.NEXT_PUBLIC_INSTITUTE_PHONE || "+91 8002271522"}.`,
    source: "fallback",
    intent: rule.intent,
    suggestions,
  };
  setServerCache(cacheKey, fallback, CHAT_CACHE_TTL_MS);
  return fallback;
}
