import { getCached, setCached } from "@/lib/cache";
import { supabaseRest } from "@/lib/supabaseRest";
import { authService } from "./authService";

export type ResultRow = {
  id: string;
  name: string;
  className: string;
  subject: string;
  marks: number;
  total: number;
  grade: string;
  exam: string;
  testDate: string;
  rollNumber: string;
};

const CACHE_KEY = "lkd_admin_results_v1";

function calculateGrade(percent: number): string {
  if (percent >= 90) return "A+";
  if (percent >= 75) return "A";
  if (percent >= 60) return "B";
  if (percent >= 45) return "C";
  return "D";
}

export const resultService = {
  async getResults(force = false): Promise<ResultRow[]> {
    if (!force) {
      const cached = getCached<ResultRow[]>(CACHE_KEY);
      if (cached) return cached;
    }

    const token = authService.getStoredSession()?.accessToken;
    const rows = await supabaseRest.from<any[]>(
      "results",
      "select=id,student_name,subject,exam,test_name,marks,total_marks,obtained_marks,test_date,roll_number,created_at&order=created_at.desc&limit=1000",
      "GET",
      undefined,
      token
    );

    const data: ResultRow[] = rows.map((row) => {
      const total = Number(row.total_marks ?? 100);
      const obtained = Number(row.obtained_marks ?? row.marks ?? 0);
      const percent = total > 0 ? (obtained / total) * 100 : 0;
      return {
        id: String(row.id),
        name: String(row.student_name ?? ""),
        className: "General",
        subject: String(row.subject ?? "General"),
        marks: obtained,
        total,
        grade: calculateGrade(percent),
        exam: String(row.test_name ?? row.exam ?? "Test"),
        testDate: String(row.test_date ?? row.created_at ?? ""),
        rollNumber: String(row.roll_number ?? ""),
      };
    });

    setCached(CACHE_KEY, data);
    return data;
  },

  async upsertMany(rows: Array<{
    rollNumber: string;
    name: string;
    exam: string;
    subject: string;
    marks: number;
    total: number;
  }>): Promise<void> {
    const token = authService.getStoredSession()?.accessToken;
    const payload = rows.map((row) => ({
      roll_number: row.rollNumber,
      student_name: row.name,
      exam: row.exam,
      test_name: row.exam,
      subject: row.subject,
      marks: String(row.marks),
      obtained_marks: row.marks,
      total_marks: row.total,
      year: new Date().getFullYear(),
      test_date: new Date().toISOString().slice(0, 10),
    }));

    await supabaseRest.from("results", "", "POST", payload, token);
  },

  async updateResult(row: ResultRow): Promise<void> {
    const token = authService.getStoredSession()?.accessToken;
    await supabaseRest.from(
      "results",
      `id=eq.${row.id}`,
      "PATCH",
      {
        student_name: row.name,
        subject: row.subject,
        marks: String(row.marks),
        obtained_marks: row.marks,
        total_marks: row.total,
        test_name: row.exam,
      },
      token
    );
  },

  async deleteResult(id: string): Promise<void> {
    const token = authService.getStoredSession()?.accessToken;
    await supabaseRest.from("results", `id=eq.${id}`, "DELETE", undefined, token);
  },

  async getMyResults(rollNumber: string, force = false): Promise<ResultRow[]> {
    const all = await this.getResults(force);
    return all.filter((item) => item.rollNumber === rollNumber);
  },
};
