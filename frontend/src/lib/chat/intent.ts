import type { ChatIntent, RuleMatch } from "@/lib/chat/types";

const INTENT_KEYWORDS: Record<Exclude<ChatIntent, "unknown">, string[]> = {
  fees: [
    "fee",
    "fees",
    "fess",
    "price",
    "pricing",
    "cost",
    "amount",
    "payment",
    "charge",
    "monthly fee",
    "kitna fee",
    "kitni fee",
    "fees kitni hai",
    "fees kya hai",
    "kitna paisa",
    "paisa kitna",
    "shulk",
    "फीस",
    "फिस",
    "कितनी फीस",
    "कितना फीस"
  ],
  courses: [
    "course",
    "courses",
    "couse",
    "couses",
    "corses",
    "class",
    "classes",
    "subject",
    "batch",
    "program",
    "coaching",
    "available class",
    "kaun kaun class",
    "kon kon class",
    "which class",
    "कौन सी क्लास",
    "कोर्स",
    "क्लास"
  ],
  timings: [
    "timing",
    "timings",
    "time",
    "schedule",
    "batch time",
    "class time",
    "batch timing",
    "kab se class",
    "kitne baje",
    "morning",
    "evening",
    "samay",
    "time kya hai",
    "timing kya hai",
    "कितने बजे",
    "समय",
    "टाइम"
  ],
  admission: [
    "admission",
    "admissions",
    "admisson",
    "enroll",
    "enrollment",
    "register",
    "registration",
    "join",
    "apply",
    "admit",
    "addmission",
    "dakhila",
    "नामांकन",
    "एडमिशन",
    "रजिस्ट्रेशन",
    "join kaise kare"
  ],
  results: [
    "result",
    "results",
    "reslt",
    "rank",
    "marks",
    "score",
    "exam result",
    "test result",
    "roll number",
    "certificate",
    "tse",
    "परिणाम",
    "रिजल्ट",
    "मार्क्स",
    "सर्टिफिकेट"
  ],
  contact: [
    "contact",
    "contcat",
    "phone",
    "mobile",
    "call",
    "email",
    "address",
    "location",
    "map",
    "where",
    "support",
    "help",
    "whatsapp",
    "number",
    "sampark",
    "instotude",
    "institude",
    "institute",
    "संपर्क",
    "फोन",
    "मोबाइल",
    "पता",
    "कहाँ"
  ],
  founder: [
    "founder",
    "fonder",
    "laliteshwar",
    "mr laliteshwar",
    "who is founder",
    "founder kaun hai",
    "founder ke bare me",
    "founder about",
    "meet our founder"
  ],
  about: [
    "about",
    "about lkd",
    "about classes",
    "mission",
    "vision",
    "why choose",
    "why lkd",
    "about institute",
    "lkd classes ke bare me",
    "coaching ke bare me"
  ],
  achievements: [
    "achievement",
    "achievements",
    "achivements",
    "achivemnets",
    "milestone",
    "milestones",
    "timeline",
    "journey",
    "rankers",
    "topper",
    "award",
    "awards",
    "success",
    "achievement bata",
    "timeline bata"
  ],
  greeting: [
    "hi",
    "hello",
    "hey",
    "namaste",
    "hii",
    "good morning",
    "good evening",
    "राम राम",
    "नमस्ते",
    "हेलो"
  ]
};

const INTENT_PRIORITY: ChatIntent[] = [
  "founder",
  "achievements",
  "about",
  "contact",
  "results",
  "timings",
  "admission",
  "fees",
  "courses",
  "greeting",
  "unknown"
];

function normalize(input: string) {
  return input.toLowerCase().replace(/[?.,!]/g, " ").replace(/\s+/g, " ").trim();
}

export function detectIntent(query: string): RuleMatch {
  const normalized = normalize(query);
  const scored: RuleMatch[] = [];

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as Array<[
    Exclude<ChatIntent, "unknown">,
    string[]
  ]>) {
    const matchedKeywords = keywords.filter((keyword) => normalized.includes(keyword));
    const score = matchedKeywords.length;
    scored.push({ intent, score, matchedKeywords });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return INTENT_PRIORITY.indexOf(a.intent) - INTENT_PRIORITY.indexOf(b.intent);
  });

  const best = scored[0];

  if (!best || best.score <= 0) {
    return { intent: "unknown", score: 0, matchedKeywords: [] };
  }

  return best;
}

export function normalizeChatQuery(query: string) {
  return normalize(query);
}
