const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function getHeaders() {
  const apiKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !apiKey) {
    throw new Error("Supabase environment variables are missing");
  }

  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof body === "string"
      ? body
      : body?.message || body?.error || "Supabase request failed";
    throw new Error(message);
  }

  return body as T;
}

export async function fetchSupabaseTable<T>(table: string, query = "") {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return parseResponse<T>(response);
}

export async function callSupabaseRpc<T>(fn: string, body: Record<string, unknown>) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return parseResponse<T>(response);
}
