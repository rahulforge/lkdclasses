const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

type AuthUser = {
  id: string;
  email?: string;
};

type ProfileRow = {
  id: string;
  role?: string | null;
  name?: string | null;
};

function getAdminHeaders() {
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
      : body?.message || body?.error || "Request failed";
    throw new Error(message);
  }

  return body as T;
}

export async function verifyAdminAccess(accessToken: string): Promise<AuthUser> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase environment variables are missing");
  }

  const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const user = await parseResponse<AuthUser>(authResponse);

  const profileResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=id,role,name&limit=1`,
    {
      method: "GET",
      headers: getAdminHeaders(),
      cache: "no-store",
    }
  );

  const profiles = await parseResponse<ProfileRow[]>(profileResponse);
  const profile = profiles[0];
  const role = String(profile?.role ?? "").toLowerCase();

  if (role !== "admin" && role !== "teacher") {
    throw new Error("Admin access required");
  }

  return user;
}

export async function adminFetchTable<T>(table: string, query = "") {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: getAdminHeaders(),
      cache: "no-store",
    }
  );

  return parseResponse<T>(response);
}

export async function adminWriteTable<T>(
  table: string,
  method: "POST" | "PATCH" | "DELETE",
  query = "",
  body?: Record<string, unknown> | Array<Record<string, unknown>>
) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`,
    {
      method,
      headers: {
        ...getAdminHeaders(),
        Prefer: "return=representation",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    }
  );

  return parseResponse<T>(response);
}
