import crypto from "node:crypto";

type Json = Record<string, unknown>;

type SupabaseRow = Record<string, unknown>;
type PromoDiscountResult = {
  code: string | null;
  discountAmount: number;
  isValid: boolean;
  reason?: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

const FALLBACK_PLAN_MAP: Record<string, { amount: number; months: number; label: string }> = {
  monthly: { amount: 499, months: 1, label: "Monthly" },
  half_year: { amount: 2499, months: 6, label: "6 Months" },
  yearly: { amount: 4499, months: 12, label: "1 Year" },
};

const PLAN_CACHE_TTL_MS = 5 * 60 * 1000;

let planCache:
  | {
      time: number;
      map: Record<string, { amount: number; months: number; label: string }>;
      list: Array<{
        id: string;
        label: string;
        amount: number;
        months: number;
      }>;
    }
  | null = null;

function assertEnv() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
  }
}

function sbHeaders(): HeadersInit {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function parseResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = body?.message || body?.error_description || body?.hint || "Request failed";
    throw new Error(message);
  }
  return body as T;
}

export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "").trim();
}

export function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export async function getPlanMap(force = false): Promise<
  Record<string, { amount: number; months: number; label: string }>
> {
  if (!force && planCache && Date.now() - planCache.time < PLAN_CACHE_TTL_MS) {
    return planCache.map;
  }

  try {
    const rows = await sbSelect(
      "subscription_plans",
      "is_active=eq.true&select=code,title,amount,duration_months,sort_order&order=sort_order.asc,duration_months.asc"
    );

    if (!rows.length) {
      planCache = {
        time: Date.now(),
        map: FALLBACK_PLAN_MAP,
        list: Object.entries(FALLBACK_PLAN_MAP).map(([id, value]) => ({
          id,
          label: value.label,
          amount: value.amount,
          months: value.months,
        })),
      };
      return FALLBACK_PLAN_MAP;
    }

    const nextMap: Record<string, { amount: number; months: number; label: string }> = {};
    const nextList: Array<{ id: string; label: string; amount: number; months: number }> = [];

    for (const row of rows) {
      const id = String(row.code ?? "").trim();
      if (!id) continue;
      const mapped = {
        amount: Math.max(0, Number(row.amount ?? 0)),
        months: Math.max(1, Number(row.duration_months ?? 1)),
        label: String(row.title ?? id),
      };
      nextMap[id] = mapped;
      nextList.push({ id, ...mapped });
    }

    if (!Object.keys(nextMap).length) {
      return FALLBACK_PLAN_MAP;
    }

    planCache = {
      time: Date.now(),
      map: nextMap,
      list: nextList,
    };

    return nextMap;
  } catch {
    return FALLBACK_PLAN_MAP;
  }
}

export async function getActivePlans(force = false): Promise<
  Array<{ id: string; label: string; amount: number; months: number }>
> {
  if (!force && planCache && Date.now() - planCache.time < PLAN_CACHE_TTL_MS) {
    return planCache.list;
  }
  await getPlanMap(force);
  return planCache?.list ?? Object.entries(FALLBACK_PLAN_MAP).map(([id, value]) => ({
    id,
    label: value.label,
    amount: value.amount,
    months: value.months,
  }));
}

export async function getPlanByAmount(amount: number): Promise<{
  amount: number;
  months: number;
  label: string;
}> {
  const plans = await getPlanMap();
  const rounded = Math.round(amount);
  const match = Object.values(plans).find((plan) => plan.amount === rounded);
  return match ?? plans.monthly ?? FALLBACK_PLAN_MAP.monthly;
}

export async function getPromoDiscount(
  promoCodeRaw: string | null | undefined,
  subtotal: number
): Promise<PromoDiscountResult> {
  const code = String(promoCodeRaw ?? "").trim().toUpperCase();
  const safeSubtotal = Math.max(0, Math.round(subtotal));

  if (!code || safeSubtotal <= 0) {
    return { code: null, discountAmount: 0, isValid: false, reason: "No promo code" };
  }

  try {
    const rows = await sbSelect(
      "promo_codes",
      `code=eq.${encodeURIComponent(code)}&is_active=eq.true&select=*&limit=1`
    );
    const promo = rows[0];
    if (!promo) {
      return { code: null, discountAmount: 0, isValid: false, reason: "Invalid promo code" };
    }

    const expiresAt = String(promo.expires_at ?? "").trim();
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      return { code: null, discountAmount: 0, isValid: false, reason: "Promo code expired" };
    }

    const minAmount = Number(promo.min_amount ?? 0);
    if (minAmount > 0 && safeSubtotal < minAmount) {
      return { code: null, discountAmount: 0, isValid: false, reason: `Minimum amount is Rs ${minAmount}` };
    }

    const promoType = String(promo.discount_type ?? "").toLowerCase();
    const percent =
      Number(promo.discount_percent ?? promo.discount_percentage ?? promo.percent_off ?? 0);
    const flatAmount = Number(promo.discount_amount ?? promo.amount_off ?? promo.flat_amount ?? 0);

    let discount = 0;
    if ((promoType.includes("percent") || promoType.includes("%")) && percent > 0) {
      discount = Math.round((safeSubtotal * percent) / 100);
    } else if ((promoType.includes("flat") || promoType.includes("amount")) && flatAmount > 0) {
      discount = Math.round(flatAmount);
    } else if (percent > 0) {
      discount = Math.round((safeSubtotal * percent) / 100);
    } else if (flatAmount > 0) {
      discount = Math.round(flatAmount);
    }

    discount = Math.min(Math.max(0, discount), safeSubtotal);
    if (discount <= 0) {
      return { code: null, discountAmount: 0, isValid: false, reason: "No discount configured" };
    }

    return { code, discountAmount: discount, isValid: true };
  } catch {
    return { code: null, discountAmount: 0, isValid: false, reason: "Promo validation failed" };
  }
}

export async function sbSelect(table: string, query: string): Promise<SupabaseRow[]> {
  assertEnv();
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  return parseResponse<SupabaseRow[]>(res);
}

export async function sbInsert(table: string, payload: Json | Json[]): Promise<SupabaseRow[]> {
  assertEnv();
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: "POST",
    headers: sbHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  return parseResponse<SupabaseRow[]>(res);
}

export async function sbUpdate(table: string, filterQuery: string, payload: Json): Promise<SupabaseRow[]> {
  assertEnv();
  const url = `${SUPABASE_URL}/rest/v1/${table}?${filterQuery}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: sbHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  return parseResponse<SupabaseRow[]>(res);
}

export async function sbRpc<T = unknown>(fn: string, payload: Json): Promise<T> {
  assertEnv();
  const url = `${SUPABASE_URL}/rest/v1/rpc/${fn}`;
  const res = await fetch(url, {
    method: "POST",
    headers: sbHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  return parseResponse<T>(res);
}

export async function createRazorpayOrder(input: {
  amountInRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  assertEnv();
  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.max(1, Math.round(input.amountInRupees * 100)),
      currency: "INR",
      receipt: input.receipt,
      payment_capture: 1,
      notes: input.notes ?? {},
    }),
  });

  return parseResponse<{
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  }>(res);
}

export function verifyRazorpaySignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  assertEnv();
  const digest = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");

  return digest === input.signature;
}

export function getRazorpayKeyId(): string {
  assertEnv();
  return RAZORPAY_KEY_ID;
}
