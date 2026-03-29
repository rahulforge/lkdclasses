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

export type TseresultRow = {
  id: string;
  className?: string | null;
  code?: string | null;
  rollNumber: string;
  name: string;
  rank: number | null;
  rightCount: number | null;
  wrongCount: number | null;
  total: number | null;
  percentage: number | null;
  certificateUrl: string | null;
  examName: string | null;
  testDate: string | null;
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

  async getTseResult(rollNumber: string, className: string): Promise<TseresultRow | null> {
  const safeRoll = encodeURIComponent(rollNumber.trim());
  const safeClass = encodeURIComponent(className.trim());
     const rows = await supabaseRest.from<any[]>(
    "tse_results",
    `roll_number=eq.${safeRoll}&class=eq.${safeClass}&select=id,roll_number,student_name,rank,right_count,wrong_count,total,percentage,certificate_url,exam_name,test_date&limit=1`,
    "GET"
  );
    const row = rows[0];
    if (!row) return null;
    return {
      id: String(row.id),
      rollNumber: String(row.roll_number ?? ""),
      name: String(row.student_name ?? ""),
      rank: row.rank ?? null,
      rightCount: row.right_count ?? null,
      wrongCount: row.wrong_count ?? null,
      total: row.total ?? null,
      percentage: row.percentage ?? null,
      certificateUrl: row.certificate_url ?? null,
      examName: row.exam_name ?? "TSE",
      testDate: row.test_date ?? null,
    };
  },

  async getTseResults(): Promise<TseresultRow[]> {
    const rows = await supabaseRest.from<any[]>(
      "tse_results",
      "select=id,roll_number,student_name,rank,right_count,wrong_count,total,percentage,certificate_url,exam_name,test_date,class,code&order=created_at.desc&limit=2000",
      "GET"
    );
    return rows.map((row) => ({
      id: String(row.id),
      className: row.class ?? null,
      code: row.code ?? null,
      rollNumber: String(row.roll_number ?? ""),
      name: String(row.student_name ?? ""),
      rank: row.rank ?? null,
      rightCount: row.right_count ?? null,
      wrongCount: row.wrong_count ?? null,
      total: row.total ?? null,
      percentage: row.percentage ?? null,
      certificateUrl: row.certificate_url ?? null,
      examName: row.exam_name ?? "TSE",
      testDate: row.test_date ?? null,
    }));
  },

  async upsertTseMany(rows: Array<{
    className?: string | null;
    code?: string | null;
    rollNumber: string;
    name: string;
    rank?: number | null;
    right?: number | null;
    wrong?: number | null;
    total?: number | null;
    percentage?: number | null;
    certificateUrl?: string | null;
    examName?: string | null;
    testDate?: string | null;
  }>): Promise<void> {
    const payload = rows.map((row) => ({
      class: row.className ?? null,
      code: row.code ?? null,
      roll_number: row.rollNumber,
      student_name: row.name,
      rank: row.rank ?? null,
      right_count: row.right ?? null,
      wrong_count: row.wrong ?? null,
      total: row.total ?? null,
      percentage: row.percentage ?? null,
      certificate_url: row.certificateUrl ?? null,
      exam_name: row.examName ?? "TSE",
      test_date: row.testDate ?? null,
    }));

    await supabaseRest.from("tse_results", "", "POST", payload);
  },
};
