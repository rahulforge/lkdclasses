import { expandQueryVariants } from "@/lib/chat/kb";
import type { ChatIntent, RuleMatch } from "@/lib/chat/types";

const INTENT_KEYWORDS: Record<Exclude<ChatIntent, "unknown">, string[]> = {
  fees: ["fee", "fees", "fess", "price", "pricing", "cost", "amount", "charge", "monthly fee", "shulk", "फीस"],
  courses: ["course", "courses", "couse", "couses", "corses", "class", "classes", "subject", "batch", "coaching", "कोर्स", "क्लास"],
  timings: ["timing", "timings", "time", "schedule", "batch time", "class time", "kitne baje", "morning", "evening", "समय"],
  admission: ["admission", "admissions", "admisson", "enroll", "enrollment", "register", "registration", "join", "apply", "admit", "addmission", "नामांकन", "एडमिशन"],
  results: ["result", "results", "reslt", "rank", "marks", "score", "exam result", "roll number", "certificate", "tse", "रिजल्ट"],
  contact: ["contact", "contcat", "phone", "mobile", "call", "email", "address", "location", "map", "support", "help", "number", "instotude", "institude", "institute", "संपर्क"],
  founder: ["founder", "fonder", "laliteshwar", "who is founder", "founder kaun hai", "founder ke bare me"],
  about: ["about", "mission", "vision", "why choose", "why lkd", "about institute", "coaching ke bare me"],
  achievements: ["achievement", "achievements", "achivements", "achivemnets", "milestone", "milestones", "timeline", "journey", "rankers", "topper", "award", "success"],
  greeting: ["hi", "hello", "hey", "namaste", "hii", "good morning", "good evening", "नमस्ते"],
};

const INTENT_PRIORITY: ChatIntent[] = ["admission", "fees", "results", "contact", "founder", "achievements", "about", "timings", "courses", "greeting", "unknown"];

function normalize(input: string) {
  return input.toLowerCase().replace(/[?.,!]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreIntent(text: string, intent: Exclude<ChatIntent, "unknown">) {
  const keywords = INTENT_KEYWORDS[intent];
  const matchedKeywords = keywords.filter((keyword) => text.includes(keyword));
  return { intent, score: matchedKeywords.length, matchedKeywords };
}

export function detectIntent(query: string): RuleMatch {
  const variants = expandQueryVariants(query).map(normalize);
  const bestByIntent = new Map<Exclude<ChatIntent, "unknown">, RuleMatch>();

  for (const variant of variants) {
    for (const intent of Object.keys(INTENT_KEYWORDS) as Array<Exclude<ChatIntent, "unknown">>) {
      const scored = scoreIntent(variant, intent);
      const existing = bestByIntent.get(intent);
      if (!existing || scored.score > existing.score) {
        bestByIntent.set(intent, scored);
      }
    }
  }

  const scored = Array.from(bestByIntent.values());
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return INTENT_PRIORITY.indexOf(a.intent) - INTENT_PRIORITY.indexOf(b.intent);
  });

  const best = scored[0];
  if (!best || best.score <= 0) return { intent: "unknown", score: 0, matchedKeywords: [] };
  return best;
}

export function normalizeChatQuery(query: string) {
  return normalize(query);
}
