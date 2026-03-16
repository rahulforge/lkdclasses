import { getCached, setCached } from "@/lib/cache";
import { supabaseRest } from "@/lib/supabaseRest";
import { authService } from "./authService";
import { studentService } from "./studentService";

export type PaymentRow = {
  id: string;
  rollNo: string;
  name: string;
  className: string;
  amount: number;
  type: string;
  mode: string;
  date: string;
  status: "Paid" | "Pending";
  details: string;
};

const CACHE_KEY = "lkd_admin_payments_v1";

export const paymentService = {
  async getPayments(force = false): Promise<PaymentRow[]> {
    if (!force) {
      const cached = getCached<PaymentRow[]>(CACHE_KEY);
      if (cached) return cached;
    }

    const token = authService.getStoredSession()?.accessToken;
    const [tracking, students] = await Promise.all([
      supabaseRest.from<any[]>(
        "payment_tracking",
        "select=id,roll_number,amount,status,paid_date,payment_mode,paid_month&order=paid_date.desc&limit=500",
        "GET",
        undefined,
        token
      ),
      studentService.getStudents(force),
    ]);

    const studentByRoll = new Map(students.map((s) => [s.rollNo, s]));

    const rows: PaymentRow[] = tracking.map((row) => {
      const student = studentByRoll.get(String(row.roll_number ?? ""));
      return {
        id: String(row.id),
        rollNo: String(row.roll_number ?? ""),
        name: student?.name ?? "-",
        className: student?.className ?? "-",
        amount: Number(row.amount ?? 0),
        type: "Monthly",
        mode: String(row.payment_mode ?? "Offline"),
        date: String(row.paid_date ?? row.paid_month ?? ""),
        status: row.status === "success" || row.status === "paid" ? "Paid" : "Pending",
        details: "",
      };
    });

    setCached(CACHE_KEY, rows);
    return rows;
  },

  async createPayment(input: {
    rollNo: string;
    amount: number;
    mode: string;
    status: "Paid" | "Pending";
  }): Promise<void> {
    const token = authService.getStoredSession()?.accessToken;
    await supabaseRest.from(
      "payment_tracking",
      "",
      "POST",
      {
        roll_number: input.rollNo.trim(),
        amount: input.amount,
        status: input.status === "Paid" ? "success" : "pending",
        paid_date: new Date().toISOString().slice(0, 10),
        payment_mode: input.mode.toLowerCase(),
      },
      token
    );
  },

  async updatePaymentStatus(id: string, status: "Paid" | "Pending"): Promise<void> {
    const token = authService.getStoredSession()?.accessToken;
    await supabaseRest.from(
      "payment_tracking",
      `id=eq.${id}`,
      "PATCH",
      {
        status: status === "Paid" ? "success" : "pending",
      },
      token
    );
  },

  async getMyPayments(rollNumber: string, force = false): Promise<PaymentRow[]> {
    const all = await this.getPayments(force);
    return all.filter((item) => item.rollNo === rollNumber);
  },
};
