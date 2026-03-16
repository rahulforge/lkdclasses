const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function assertEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
}

type SessionPayload = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: {
    id: string;
    email?: string;
  };
};

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof body === "string"
      ? body
      : body?.msg || body?.error_description || body?.message || "Request failed";
    throw new Error(message);
  }

  return body as T;
}

function authHeaders(token?: string): HeadersInit {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token ?? SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

export const supabaseRest = {
  getUrl() {
    assertEnv();
    return SUPABASE_URL;
  },

  async signInWithPassword(email: string, password: string): Promise<SessionPayload> {
    assertEnv();
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    return parseResponse<SessionPayload>(response);
  },

  async signUp(email: string, password: string): Promise<SessionPayload> {
    assertEnv();
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    return parseResponse<SessionPayload>(response);
  },

  async getUser(accessToken: string) {
    assertEnv();
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return parseResponse<{ id: string; email?: string }>(response);
  },

  async signOut(accessToken: string): Promise<void> {
    assertEnv();
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async from<T>(
    table: string,
    query: string,
    method: HttpMethod = "GET",
    body?: unknown,
    token?: string
  ): Promise<T> {
    assertEnv();
    const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`;
    const response = await fetch(url, {
      method,
      headers: authHeaders(token),
      body: body ? JSON.stringify(body) : undefined,
    });

    return parseResponse<T>(response);
  },
};

export type { SessionPayload };
