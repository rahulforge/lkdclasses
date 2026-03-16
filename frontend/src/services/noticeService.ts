import { getCached, setCached } from "@/lib/cache";
import { supabaseRest } from "@/lib/supabaseRest";
import { authService } from "./authService";

export type NoticeItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
};

const CACHE_KEY = "lkd_notices_v1";

export const noticeService = {
  async getLatest(limit = 5, force = false): Promise<NoticeItem[]> {
    if (!force) {
      const cached = getCached<NoticeItem[]>(CACHE_KEY);
      if (cached) return cached.slice(0, limit);
    }

    const token = authService.getStoredSession()?.accessToken;
    const rows = await supabaseRest.from<any[]>(
      "notices",
      `select=id,title,message,created_at&order=created_at.desc&limit=${Math.max(1, limit)}`,
      "GET",
      undefined,
      token
    );

    const notices = rows.map((row) => ({
      id: String(row.id),
      title: String(row.title ?? ""),
      message: String(row.message ?? ""),
      createdAt: String(row.created_at ?? ""),
    }));

    setCached(CACHE_KEY, notices);
    return notices;
  },
};
