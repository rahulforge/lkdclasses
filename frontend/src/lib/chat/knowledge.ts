import { COURSE_PRICING } from "@/config/coursePricing";
import { findKnowledgeByIntent } from "@/lib/chat/kb";
import type { ChatIntent } from "@/lib/chat/types";

const phone = process.env.NEXT_PUBLIC_INSTITUTE_PHONE || "+91 8002271522";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const resultsUrl = process.env.NEXT_PUBLIC_RESULTS_URL || "/result";
const coursesUrl = `${siteUrl}/courses`;
const founderUrl = `${siteUrl}/founder`;
const resultUrl = `${siteUrl}${resultsUrl}`;
const appAccessFee = Math.max(0, Number(process.env.NEXT_PUBLIC_APP_ACCESS_FEE ?? 50));

function getClassFeeLine(className: string) {
  const item = COURSE_PRICING.find((course) => course.label.toLowerCase() === className.toLowerCase());
  if (!item) return null;
  return `${item.label} ki monthly fee ₹${item.pricing.monthly} hai.`;
}

function getCompetitionFeeLine() {
  const item = COURSE_PRICING.find((course) => course.label.toLowerCase() === "competition");
  return item ? `Competition batch ki monthly fee ₹${item.pricing.monthly} hai.` : null;
}

export function extractClassFromQuery(query: string): string | null {
  const text = query.toLowerCase();
  if (text.includes("competition") || text.includes("comp")) return "Competition";
  for (let i = 6; i <= 12; i += 1) {
    const patterns = [`class ${i}`, `${i} class`, `${i}th`, `${i}`, `${i} ka`, `${i} ki`];
    if (patterns.some((pattern) => text.includes(pattern))) return `Class ${i}`;
  }
  return null;
}

export function getRuleAnswer(intent: ChatIntent, query?: string) {
  if (intent === "fees" && query) {
    const className = extractClassFromQuery(query);
    if (className === "Competition") {
      const feeLine = getCompetitionFeeLine();
      if (feeLine) return `${feeLine}\nRegistration/app access charge ₹${appAccessFee} hai. Open Courses Page: ${coursesUrl}`;
    }
    if (className) {
      const feeLine = getClassFeeLine(className);
      if (feeLine) return `${feeLine}\nRegistration/app access charge ₹${appAccessFee} hai. Open Courses Page: ${coursesUrl}`;
    }
  }

  if (intent === "results" && query) {
    const text = query.toLowerCase();
    if (text.includes("kab") || text.includes("when") || text.includes("aaega") || text.includes("aayega")) {
      return `The exact result date is not published here. For the latest update, call ${phone}. Open Result Page: ${resultUrl}`;
    }
  }

  if (intent === "founder" && query) {
    const text = query.toLowerCase();
    if (text.includes("timeline") || text.includes("journey") || text.includes("milestone")) {
      return `Founder timeline highlights include 2007 local teaching start, 2013 LKD Classes foundation, 2017 expansion, and major recognitions in 2023, 2024 and 2025. Open Founder Page: ${founderUrl}`;
    }
  }

  const item = findKnowledgeByIntent(intent);
  if (!item) return null;
  return item.pageUrl ? `${item.answer} Open ${item.title.includes("Founder") ? "Founder" : item.title.includes("About") ? "About" : item.title.includes("Courses") ? "Courses" : item.title.includes("Results") ? "Result" : item.title.includes("Contact") ? "Contact" : item.title} Page: ${item.pageUrl}` : item.answer;
}

export function getQuickSuggestions(intent: ChatIntent): string[] {
  const byIntent: Partial<Record<ChatIntent, string[]>> = {
    fees: ["Class 10 fee", "Class 11 fee", "Competition fee"],
    courses: ["Courses batao", "Batch timing", "Fees kitni hai"],
    timings: ["Morning batch", "Evening batch", "Contact number"],
    admission: ["Admission kaise hoga", "Register page", "Contact"],
    results: ["Result link", "Result kab aayega", "Certificate"],
    contact: ["Phone number", "Email", "Address"],
    founder: ["Founder kaun hai", "Founder timeline", "Founder message"],
    about: ["Mission", "Vision", "Why choose LKD Classes"],
    achievements: ["Achievements batao", "Timeline batao", "Topper info"],
    unknown: ["Fees", "Courses", "Founder"],
    greeting: ["Fees", "Courses", "Contact"],
  };
  return byIntent[intent] ?? ["Fees", "Courses", "Contact"];
}
