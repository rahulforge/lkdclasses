import { COURSE_PRICING } from "@/config/coursePricing";
import type { ChatIntent } from "@/lib/chat/types";

const instituteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";
const institutePhone = process.env.NEXT_PUBLIC_INSTITUTE_PHONE || "+91 8002271522";
const instituteEmail = process.env.NEXT_PUBLIC_INSTITUTE_EMAIL || "lkdclasses2007@gmail.com";
const instituteAddress = process.env.NEXT_PUBLIC_INSTITUTE_ADDRESS || "Parsa Road, Sitalpur, Saran, Bihar, India";
const resultsUrl = process.env.NEXT_PUBLIC_RESULTS_URL || "/result";
const registerUrl = process.env.NEXT_PUBLIC_REGISTER_URL || "/register";
const contactUrl = process.env.NEXT_PUBLIC_CONTACT_URL || "/contact";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const founderPageUrl = `${siteUrl}/founder`;
const aboutPageUrl = `${siteUrl}/about`;
const coursesPageUrl = `${siteUrl}/courses`;
const resultPageUrl = `${siteUrl}${resultsUrl}`;
const contactPageUrl = `${siteUrl}${contactUrl}`;
const directContactLine = `For direct help, call ${institutePhone}.`;
const instituteTimings =
  process.env.NEXT_PUBLIC_INSTITUTE_TIMINGS ||
  `Morning aur evening batches available hain. Exact latest batch timing ke liye ${directContactLine}`;
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

function formatFees() {
  return COURSE_PRICING.map((course) => `• ${course.label}: ₹${course.pricing.monthly}/month`).join("\n");
}

function formatCourses() {
  return COURSE_PRICING.map((course) => `• ${course.label}`).join("\n");
}

export function extractClassFromQuery(query: string): string | null {
  const text = query.toLowerCase();
  if (text.includes("competition") || text.includes("comp") || text.includes("competitive")) {
    return "Competition";
  }
  for (let i = 6; i <= 12; i += 1) {
    const patterns = [`${i}`, `${i}th`, `${i} class`, `class ${i}`, `${i} ka`, `${i} ki`, `${i}th class`];
    if (patterns.some((pattern) => text.includes(pattern))) return `Class ${i}`;
  }
  return null;
}

const RULE_ANSWERS: Partial<Record<ChatIntent, string>> = {
  greeting: `Welcome to ${instituteName} Assistant. You can ask about fees, courses, admission, results, founder, achievements, timings or contact details.`,
  fees: `Current monthly fee structure:\n${formatFees()}\n\nRegistration/app access charge: ₹${appAccessFee}. To view course details, open Courses Page: ${coursesPageUrl}`,
  courses: `Available courses / classes:\n${formatCourses()}\n\nCompetition batch is also available. To view full course details, open Courses Page: ${coursesPageUrl}`,
  admission: `Online admission is available here: ${siteUrl}${registerUrl}\n\nProcess: fill details, select class, pay registration/app access fee, then complete registration. For additional support, open Contact Page: ${contactPageUrl}`,
  timings: `${instituteTimings}\nFor institute overview, open About Page: ${aboutPageUrl}`,
  contact: `Contact details:\n• Phone: ${institutePhone}\n• Email: ${instituteEmail}\n• Address: ${instituteAddress}\n• Open Contact Page: ${contactPageUrl}`,
  results: `Published results and TSE results are available here. Open Result Page: ${resultPageUrl}\nIf you need direct help, call ${institutePhone}.`,
  founder: `Founder information: Mr. Laliteshwar Kumar is the founder of LKD Classes. The founder page includes his background, message, milestones and recognitions. Open Founder Page: ${founderPageUrl}`,
  about: `About LKD Classes: the website highlights mission, vision, expert faculty, structured learning, result-oriented guidance, founder message and contact information. Open About Page: ${aboutPageUrl}`,
  achievements: `Achievements and milestones include 19+ years of excellence, 5700+ students mentored, 500+ top rankers and 10+ dedicated faculty. For the detailed founder journey and timeline, open Founder Page: ${founderPageUrl}`,
};

export function getRuleAnswer(intent: ChatIntent, query?: string) {
  if (intent === "fees" && query) {
    const className = extractClassFromQuery(query);
    if (className === "Competition") {
      const feeLine = getCompetitionFeeLine();
      if (feeLine) return `${feeLine}\nRegistration/app access charge ₹${appAccessFee} hai. Open Courses Page: ${coursesPageUrl}`;
    }
    if (className) {
      const feeLine = getClassFeeLine(className);
      if (feeLine) return `${feeLine}\nRegistration/app access charge ₹${appAccessFee} hai. Open Courses Page: ${coursesPageUrl}`;
    }
  }

  if (intent === "results" && query) {
    const text = query.toLowerCase();
    if (text.includes("kab") || text.includes("when") || text.includes("aaega") || text.includes("aayega")) {
      return `The exact result date is not published here. For the latest update, call ${institutePhone}. Open Result Page: ${resultPageUrl}`;
    }
  }

  if (intent === "founder" && query) {
    const text = query.toLowerCase();
    if (text.includes("timeline") || text.includes("journey") || text.includes("milestone")) {
      return `Founder timeline highlights: 2007 local teaching start, 2013 LKD Classes foundation, 2017 expansion, and multiple topper recognitions in 2023, 2024 and 2025. Open Founder Page: ${founderPageUrl}`;
    }
    if (text.includes("message")) {
      return `Founder message focuses on character, discipline, curiosity and full student potential. Open Founder Page: ${founderPageUrl}`;
    }
  }

  if (intent === "achievements" && query) {
    const text = query.toLowerCase();
    if (text.includes("topper") || text.includes("award")) {
      return `The website includes Bihar topper verification mentions and district topper recognitions. Open Founder Page: ${founderPageUrl}`;
    }
  }

  return RULE_ANSWERS[intent] ?? null;
}

export function getQuickSuggestions(intent: ChatIntent): string[] {
  const byIntent: Partial<Record<ChatIntent, string[]>> = {
    fees: ["10th ka fee", "Competition fee", "Class 12 fee"],
    courses: ["Courses batao", "Batch timing", "Fees kitni hai"],
    timings: ["Morning batch", "Evening batch", "Contact number"],
    admission: ["Admission kaise hoga", "Registration fee", "Contact"],
    results: ["Result link", "Result kab aayega", "Certificate"],
    contact: ["Phone number", "Email", "Address"],
    founder: ["Founder kaun hai", "Founder timeline", "Founder message"],
    about: ["Mission", "Vision", "Why choose LKD Classes"],
    achievements: ["Achievements batao", "Timeline batao", "Topper info"],
    unknown: ["Fees", "Founder", "Courses"],
    greeting: ["Fees", "Founder", "Contact"],
  };

  return byIntent[intent] ?? ["Fees", "Founder", "Contact"];
}
