import { getCached, setCached } from "@/lib/cache";
import { supabaseRest } from "@/lib/supabaseRest";
import { authService } from "./authService";

export type StudentRow = {
  id: string;
  name: string;
  rollNo: string;
  className: string;
  phone: string;
  status: "Active" | "Inactive";
};

const CACHE_KEY = "lkd_admin_students_v1";

function mapClassName(raw: string | null | undefined): string {
  if (!raw) return "-";
  return raw;
}

export const studentService = {
  async getStudents(force = false): Promise<StudentRow[]> {
    if (!force) {
      const cached = getCached<StudentRow[]>(CACHE_KEY);
      if (cached) return cached;
    }

    const token = authService.getStoredSession()?.accessToken;
    const rows = await supabaseRest.from<any[]>(
      "students",
      "select=id,name,roll_number,phone,payment_status,classes(name)&order=created_at.desc&limit=500",
      "GET",
      undefined,
      token
    );

    const data: StudentRow[] = rows.map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      rollNo: String(row.roll_number ?? ""),
      className: mapClassName(row.classes?.name),
      phone: String(row.phone ?? ""),
      status: row.payment_status === "inactive" ? "Inactive" : "Active",
    }));

    setCached(CACHE_KEY, data);
    return data;
  },

  async createStudent(input: {
    name: string;
    classId: string;
    phone: string;
    status: "Active" | "Inactive";
  }): Promise<void> {
    const token = authService.getStoredSession()?.accessToken;
    await supabaseRest.from(
      "students",
      "",
      "POST",
      {
        name: input.name.trim(),
        class_id: input.classId,
        phone: input.phone.trim() || null,
        category: "school",
        student_type: "offline",
        admission_paid: true,
        payment_status: input.status === "Active" ? "full_paid" : "pending",
        admission_date: new Date().toISOString().slice(0, 10),
      },
      token
    );
  },

  async updateStudent(
    studentId: string,
    updates: {
      name: string;
      phone: string;
      status: "Active" | "Inactive";
    }
  ): Promise<void> {
    const token = authService.getStoredSession()?.accessToken;
    await supabaseRest.from(
      "students",
      `id=eq.${studentId}`,
      "PATCH",
      {
        name: updates.name.trim(),
        phone: updates.phone.trim() || null,
        payment_status: updates.status === "Active" ? "full_paid" : "pending",
      },
      token
    );
  },

  async deleteStudent(studentId: string): Promise<void> {
    const token = authService.getStoredSession()?.accessToken;
    await supabaseRest.from("students", `id=eq.${studentId}`, "DELETE", undefined, token);
  },
};
