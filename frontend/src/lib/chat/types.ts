export type ChatIntent =
  | "fees"
  | "courses"
  | "timings"
  | "admission"
  | "results"
  | "contact"
  | "founder"
  | "about"
  | "achievements"
  | "greeting"
  | "unknown";

export type RuleMatch = {
  intent: ChatIntent;
  score: number;
  matchedKeywords: string[];
};

export type RetrievedDocument = {
  id: string;
  title: string;
  category: string;
  content: string;
  source?: string | null;
  similarity?: number | null;
};

export type ChatAnswerSource = "rule" | "database" | "rag" | "fallback" | "clarification";

export type ChatResponsePayload = {
  answer: string;
  source: ChatAnswerSource;
  intent: ChatIntent;
  suggestions?: string[];
  documents?: RetrievedDocument[];
  cached?: boolean;
  needsClarification?: boolean;
  clarificationKey?: "class" | "result-type" | "general";
};
