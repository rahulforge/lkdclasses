import type { ChatIntent } from "@/lib/chat/types";

export type KnowledgeEntry = {
  id: string;
  intent: ChatIntent | "general";
  title: string;
  answer: string;
  pageUrl?: string;
  keywords: string[];
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const phone = process.env.NEXT_PUBLIC_INSTITUTE_PHONE || "+91 8002271522";
const email = process.env.NEXT_PUBLIC_INSTITUTE_EMAIL || "lkdclasses2007@gmail.com";

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: "fees-general",
    intent: "fees",
    title: "General Fees",
    answer:
      "Current monthly fee structure is available class-wise. If you tell the class, I can give the exact fee. For full course details, open Courses Page.",
    pageUrl: `${siteUrl}/courses`,
    keywords: ["fees", "fee", "price", "cost", "kitni fees", "fess"],
  },
  {
    id: "courses-general",
    intent: "courses",
    title: "Available Courses",
    answer:
      "LKD Classes offers coaching for Class 6 to Class 12, and Competition batches. For the full course listing, open Courses Page.",
    pageUrl: `${siteUrl}/courses`,
    keywords: ["courses", "course", "couses", "classes", "coaching"],
  },
  {
    id: "admission-general",
    intent: "admission",
    title: "Admission Process",
    answer:
      "Admission is completed online. Fill details, select class, pay registration or app access fee, then complete registration. For registration, open Register Page.",
    pageUrl: `${siteUrl}/register`,
    keywords: ["admission", "join", "register", "registration", "kaise hoga", "admisson"],
  },
  {
    id: "results-general",
    intent: "results",
    title: "Results",
    answer:
      "Published results and TSE results are available on the Result Page. If you need direct support, call the institute.",
    pageUrl: `${siteUrl}/result`,
    keywords: ["result", "results", "marks", "score", "tse", "reslt"],
  },
  {
    id: "contact-general",
    intent: "contact",
    title: "Contact",
    answer: `Phone: ${phone}\nEmail: ${email}\nFor full contact details, open Contact Page.`,
    pageUrl: `${siteUrl}/contact`,
    keywords: ["contact", "phone", "email", "address", "instotude", "institude"],
  },
  {
    id: "about-general",
    intent: "about",
    title: "About LKD Classes",
    answer:
      "LKD Classes focuses on mission, vision, expert faculty, structured learning, result-oriented guidance and student growth. For full institute overview, open About Page.",
    pageUrl: `${siteUrl}/about`,
    keywords: ["about", "mission", "vision", "why choose", "lkd classes ke bare me"],
  },
  {
    id: "founder-general",
    intent: "founder",
    title: "Founder",
    answer:
      "Mr. Laliteshwar Kumar is the founder of LKD Classes. The Founder Page includes his background, message, milestones and recognitions.",
    pageUrl: `${siteUrl}/founder`,
    keywords: ["founder", "fonder", "laliteshwar", "founder kaun hai"],
  },
  {
    id: "achievements-general",
    intent: "achievements",
    title: "Achievements",
    answer:
      "Key highlights include 19+ years of excellence, 5700+ students mentored, 500+ top rankers and 10+ dedicated faculty. For detailed milestones, open Founder Page.",
    pageUrl: `${siteUrl}/founder`,
    keywords: ["achievements", "achievement", "achivements", "timeline", "milestones", "topper"],
  },
];

export function expandQueryVariants(query: string): string[] {
  const normalized = query.toLowerCase().trim();
  const variants = new Set<string>([normalized]);

  const replacements: Array<[RegExp, string[]]> = [
    [/(couses|couse|corses)/g, ["courses", "course"]],
    [/(achivements|achivemnets)/g, ["achievements", "achievement"]],
    [/(fonder)/g, ["founder"]],
    [/(instotude|institude)/g, ["institute", "contact"]],
    [/(fees kya hai|fees kitni hai|price kya hai)/g, ["fees", "fee structure"]],
    [/(admission kaise hoga|join kaise kare)/g, ["admission", "registration process"]],
  ];

  for (const [pattern, outs] of replacements) {
    if (pattern.test(normalized)) {
      for (const out of outs) variants.add(normalized.replace(pattern, out));
    }
  }

  return Array.from(variants);
}

export function findKnowledgeByIntent(intent: ChatIntent): KnowledgeEntry | null {
  return KNOWLEDGE_BASE.find((item) => item.intent === intent) ?? null;
}
