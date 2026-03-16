export type PlanCode = "monthly" | "half_year" | "yearly";

export type PlanPricing = {
  monthly: number;
  half_year: number;
  yearly: number;
};

export type CoursePricingItem = {
  key: string;
  label: string;
  pricing: PlanPricing;
};

export const COURSE_PRICING: CoursePricingItem[] = [
  { key: "class_6", label: "Class 6", pricing: { monthly: 250, half_year: 250, yearly: 250 } },
  { key: "class_7", label: "Class 7", pricing: { monthly: 250, half_year: 250, yearly: 250 } },
  { key: "class_8", label: "Class 8", pricing: { monthly: 250, half_year: 250, yearly: 250 } },
  { key: "class_9", label: "Class 9", pricing: { monthly: 400, half_year: 400, yearly: 400 } },
  { key: "class_10", label: "Class 10", pricing: { monthly: 500, half_year: 500, yearly: 500 } },
  { key: "class_11", label: "Class 11", pricing: { monthly: 600, half_year: 600, yearly: 600 } },
  { key: "class_12", label: "Class 12", pricing: { monthly: 700, half_year: 700, yearly: 700 } },
  { key: "competition", label: "Competition", pricing: { monthly: 200, half_year: 200, yearly: 200 } },
];

export const CLASS_OPTIONS = COURSE_PRICING.map((item) => item.label);

const PLAN_LABEL_TO_CODE: Record<string, PlanCode> = {
  monthly: "monthly",
  "half-yearly": "half_year",
  half_year: "half_year",
  yearly: "yearly",
};

function normalize(input: string): string {
  return String(input ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function numberFromLabel(input: string): number | null {
  const match = String(input ?? "").match(/\d+/);
  if (!match) return null;
  const num = Number(match[0]);
  return Number.isFinite(num) ? num : null;
}

export function resolveClassLabel(input: string): string {
  const raw = String(input ?? "").trim();
  if (!raw) return "";

  const n = normalize(raw);
  const direct = COURSE_PRICING.find((item) => normalize(item.label) === n);
  if (direct) return direct.label;

  if (n.includes("competition") || n.includes("comp")) {
    return "Competition";
  }

  if (n.includes("6to8") || n.includes("68")) return "Class 6";
  if (n.includes("9to10") || n.includes("910")) return "Class 9";
  if (n.includes("11to12") || n.includes("1112")) return "Class 11";

  const num = numberFromLabel(raw);
  if (num && num >= 6 && num <= 12) {
    return `Class ${num}`;
  }

  return raw;
}

export function getPlanCodeFromPaymentType(paymentType: string): PlanCode {
  const key = normalize(paymentType);
  return PLAN_LABEL_TO_CODE[key] ?? "monthly";
}

export function getAmountByClassAndPlan(
  classLabelInput: string,
  planInput: string
): number {
  const classLabel = resolveClassLabel(classLabelInput);
  const planCode = getPlanCodeFromPaymentType(planInput);
  const row = COURSE_PRICING.find((item) => item.label === classLabel) ?? COURSE_PRICING[0];
  return Number(row.pricing[planCode] ?? 0);
}

export function getPlansForClass(classLabelInput: string) {
  const classLabel = resolveClassLabel(classLabelInput);
  const row = COURSE_PRICING.find((item) => item.label === classLabel) ?? COURSE_PRICING[0];
  return [{ id: "monthly" as PlanCode, label: "Monthly", amount: row.pricing.monthly, months: 1 }];
}
