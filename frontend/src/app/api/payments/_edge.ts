const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const EDGE_CREATE_ORDER_URL =
  process.env.SUPABASE_EDGE_CREATE_ORDER_URL ||
  (SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/create-payment-order` : "");

const EDGE_VERIFY_URL =
  process.env.SUPABASE_EDGE_VERIFY_URL ||
  (SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/verify-payment` : "");

const EDGE_AUTH_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

function assertEdgeEnv() {
  if (!EDGE_CREATE_ORDER_URL || !EDGE_VERIFY_URL) {
    throw new Error("Missing Supabase edge function URLs");
  }
  if (!EDGE_AUTH_KEY) {
    throw new Error("Missing Supabase edge function auth key");
  }
}

async function parseEdgeResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = body?.message || body?.error || "Edge function request failed";
    throw new Error(message);
  }
  return body as T;
}

export async function callCreatePaymentOrder(payload: Record<string, unknown>) {
  assertEdgeEnv();
  const res = await fetch(EDGE_CREATE_ORDER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${EDGE_AUTH_KEY}`,
      apikey: EDGE_AUTH_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return parseEdgeResponse<Record<string, unknown>>(res);
}

export async function callVerifyPayment(payload: Record<string, unknown>) {
  assertEdgeEnv();
  const res = await fetch(EDGE_VERIFY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${EDGE_AUTH_KEY}`,
      apikey: EDGE_AUTH_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return parseEdgeResponse<Record<string, unknown>>(res);
}
