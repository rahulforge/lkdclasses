import { supabaseRest, type SessionPayload } from "@/lib/supabaseRest";

export type AuthRole = "student" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  phone: string | null;
  role: AuthRole;
  rollNumber: string | null;
  classId: string | null;
  accessToken: string;
  refreshToken: string;
};

type RegisterInput = {
  fullName: string;
  phone: string;
  selectedClass: string;
  paymentType: string;
  password: string;
  paymentConfirmed?: boolean;
  paidAmount?: number;
  promoCode?: string;
  admissionPaid?: boolean;
  appAccessPaid?: boolean;
};

const STORAGE_KEY = "lkd_web_session_v1";

const isBrowser = typeof window !== "undefined";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").trim();
}

function phoneToEmail(phone: string): string {
  return `${normalizePhone(phone)}@lkd.app`;
}

function mapRole(role: string | null | undefined): AuthRole {
  if (role === "admin" || role === "teacher") return "admin";
  return "student";
}

async function getProfile(userId: string, token: string) {
  const rows = await supabaseRest.from<any[]>(
    "profiles",
    `id=eq.${userId}&select=id,name,phone,role,roll_number,class,payment_status,student_type,admission_paid,app_access_paid&limit=1`,
    "GET",
    undefined,
    token
  );

  return rows[0] ?? null;
}

async function getPromoStudentType(code: string, token: string): Promise<"online" | "offline"> {
  if (!code.trim()) return "online";
  const safeCode = encodeURIComponent(code.trim());
  const nowIso = new Date().toISOString();

  const rows = await supabaseRest.from<any[]>(
    "promo_codes",
    `code=eq.${safeCode}&is_active=eq.true&select=code,student_type,expires_at&limit=1`,
    "GET",
    undefined,
    token
  );

  if (!rows.length) return "online";
  const promo = rows[0];
  if (promo.expires_at && new Date(promo.expires_at).toISOString() < nowIso) {
    return "online";
  }
  return promo.student_type === "offline" ? "offline" : "online";
}

async function resolveClassId(selectedClass: string): Promise<string> {
  const rows = await supabaseRest.from<any[]>(
    "classes",
    "select=id,name&order=name.asc&limit=200",
    "GET",
    undefined
  );

  const normalizeClass = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const extractNums = (value: string) =>
    (value.match(/\d+/g) ?? []).map((item) => Number(item)).filter((n) => Number.isFinite(n));

  const normalizedInput = normalizeClass(selectedClass);
  const inputNums = extractNums(selectedClass);
  const match = rows.find((row) => {
    const normalizedName = normalizeClass(String(row.name ?? ""));
    if (normalizedName === normalizedInput || normalizedName.includes(normalizedInput)) {
      return true;
    }
    if (normalizedInput.includes("competition") || normalizedInput.includes("comp")) {
      return normalizedName.includes("competition") || normalizedName.includes("comp");
    }
    const rowNums = extractNums(String(row.name ?? ""));
    return inputNums.length > 0 && rowNums.length > 0 && rowNums[0] === inputNums[0];
  });

  if (match?.id) {
    return String(match.id);
  }

  const inputNums2 = extractNums(selectedClass);
  const numberMatch = rows.find((row) => {
    const clsNums = extractNums(String(row.name ?? ""));
    if (!clsNums.length || !inputNums2.length) return false;
    return clsNums[0] === inputNums2[0];
  });

  if (!numberMatch?.id) {
    throw new Error("Selected class is not configured in classes table");
  }

  return String(numberMatch.id);
}

function toSessionUser(session: SessionPayload, profile: any): SessionUser {
  return {
    id: session.user.id,
    name: profile?.name ?? "Student",
    phone: profile?.phone ?? null,
    role: mapRole(profile?.role),
    rollNumber: profile?.roll_number ?? null,
    classId: profile?.class ?? null,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
}

export const authService = {
  async login(identifier: string, password: string): Promise<SessionUser> {
    const trimmed = identifier.trim();
    if (!trimmed || !password.trim()) {
      throw new Error("Username and password are required");
    }

    const email = /@/.test(trimmed)
      ? trimmed
      : /^\d{10}$/.test(normalizePhone(trimmed))
        ? phoneToEmail(trimmed)
        : `${trimmed}@lkd.app`;

    const session = await supabaseRest.signInWithPassword(email, password);
    const profile = await getProfile(session.user.id, session.access_token);
    if (
      mapRole(profile?.role) === "student" &&
      String(profile?.student_type ?? "online") === "online" &&
      Boolean(profile?.app_access_paid) !== true
    ) {
      await supabaseRest.signOut(session.access_token).catch(() => undefined);
      throw new Error("Please complete app access payment before login");
    }
    const user = toSessionUser(session, profile);

    if (isBrowser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }

    return user;
  },

  async registerStudent(input: RegisterInput): Promise<SessionUser> {
    const phone = normalizePhone(input.phone);
    if (!/^\d{10}$/.test(phone)) {
      throw new Error("Enter valid 10 digit phone number");
    }
    const rawPassword = String(input.password ?? "");
    if (rawPassword.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const session = await supabaseRest.signUp(phoneToEmail(phone), rawPassword);
    const classId = await resolveClassId(input.selectedClass);
    const paymentConfirmed = Boolean(input.paymentConfirmed);
    const studentType = paymentConfirmed
      ? "online"
      : await getPromoStudentType(input.promoCode ?? "", session.access_token);
    const admissionPaid =
      Boolean(input.admissionPaid) || studentType === "offline";
    const appAccessPaid =
      Boolean(input.appAccessPaid) || studentType === "offline";
    const paymentStatus = studentType === "offline" ? "full_paid" : "pending";

    await supabaseRest.from(
      "profiles",
      "",
      "POST",
      {
        id: session.user.id,
        name: input.fullName.trim(),
        phone,
        role: "student",
        class: classId,
        student_type: studentType,
        admission_paid: admissionPaid,
        app_access_paid: appAccessPaid,
        payment_status: paymentStatus,
        is_active: true,
      },
      session.access_token
    );

    await supabaseRest.from(
      "students",
      "",
      "POST",
      {
        user_id: session.user.id,
        name: input.fullName.trim(),
        phone,
        class_id: classId,
        category: "school",
        student_type: studentType,
        admission_paid: admissionPaid,
        app_access_paid: appAccessPaid,
        payment_status: paymentStatus,
        admission_date: new Date().toISOString().slice(0, 10),
      },
      session.access_token
    );

    // Ensure roll number is assigned for the new student.
    try {
      await supabaseRest.rpc("assign_roll_for_user", { p_user_id: session.user.id }, session.access_token);
    } catch {
      // Roll assignment should not block registration.
    }

    await supabaseRest.from(
      "subscriptions",
      "",
      "POST",
      {
        user_id: session.user.id,
        is_active: admissionPaid,
        plan_type: studentType,
      },
      session.access_token
    );

    if (paymentConfirmed) {
      await supabaseRest.from(
        "payments",
        "",
        "POST",
        {
          user_id: session.user.id,
          amount: Math.max(0, Number(input.paidAmount ?? 0)),
          status: "success",
          provider: "razorpay",
          promo_code: input.promoCode?.trim() || null,
        },
        session.access_token
      );
    }

    const profile = await getProfile(session.user.id, session.access_token);
    const user = toSessionUser(session, profile);

    return user;
  },

  getStoredSession(): SessionUser | null {
    if (!isBrowser) return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  async refreshSession(): Promise<SessionUser | null> {
    const stored = this.getStoredSession();
    if (!stored?.accessToken) return null;

    try {
      const user = await supabaseRest.getUser(stored.accessToken);
      const profile = await getProfile(user.id, stored.accessToken);
      const merged: SessionUser = {
        ...stored,
        id: user.id,
        name: profile?.name ?? stored.name,
        phone: profile?.phone ?? stored.phone,
        role: mapRole(profile?.role),
        rollNumber: profile?.roll_number ?? stored.rollNumber,
        classId: profile?.class ?? stored.classId,
      };
      if (isBrowser) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    } catch {
      this.clearSession();
      return null;
    }
  },

  async logout(): Promise<void> {
    const current = this.getStoredSession();
    if (current?.accessToken) {
      await supabaseRest.signOut(current.accessToken);
    }
    this.clearSession();
  },

  clearSession() {
    if (!isBrowser) return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};

