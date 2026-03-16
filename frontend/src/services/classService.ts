import { getCached, setCached } from "@/lib/cache";
import { supabaseRest } from "@/lib/supabaseRest";
import { authService } from "./authService";

export type ClassItem = {
  id: string;
  name: string;
};

const CACHE_KEY = "lkd_classes_v1";

export const classService = {
  async getClasses(force = false): Promise<ClassItem[]> {
    if (!force) {
      const cached = getCached<ClassItem[]>(CACHE_KEY);
      if (cached) return cached;
    }

    const token = authService.getStoredSession()?.accessToken;
    const rows = await supabaseRest.from<any[]>(
      "classes",
      "select=id,name&order=name.asc",
      "GET",
      undefined,
      token
    );

    const classes = rows.map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ""),
    }));

    setCached(CACHE_KEY, classes);
    return classes;
  },
};
