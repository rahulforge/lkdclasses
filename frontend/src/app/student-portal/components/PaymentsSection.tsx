"use client";

import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { paymentService, type PaymentRow } from "@/services/paymentService";

export default function PaymentsSection() {
  const [paymentsData, setPaymentsData] = useState<PaymentRow[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const session = authService.getStoredSession();
      if (!session?.rollNumber) return;
      const rows = await paymentService.getMyPayments(session.rollNumber);
      setPaymentsData(rows);
    };

    void run();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Payments</h2>

      <div className="grid gap-4">
        {paymentsData.length === 0 && <p className="text-gray-500">No payments found.</p>}
        {paymentsData.map((p) => (
          <div key={p.id} className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition" onClick={() => setSelectedPayment(selectedPayment === p.id ? null : p.id)}>
            <div className="flex justify-between">
              <span>{p.type} - Rs {p.amount}</span>
              <span className={`font-semibold ${p.status === "Paid" ? "text-green-600" : "text-red-600"}`}>{p.status}</span>
            </div>

            {selectedPayment === p.id && (
              <div className="mt-2 text-gray-700">
                {p.status === "Paid" && <p><b>Mode:</b> {p.mode}</p>}
                <p><b>Date:</b> {p.date || "-"}</p>
                {p.status === "Pending" && (
                  <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={() => {
                    const paymentUrl = process.env.NEXT_PUBLIC_PAYMENT_URL;
                    const session = authService.getStoredSession();
                    if (paymentUrl) {
                      const qs = new URLSearchParams({
                        phone: String(session?.phone ?? ""),
                        plan: "monthly",
                      });
                      window.location.href = `${paymentUrl}${paymentUrl.includes("?") ? "&" : "?"}${qs.toString()}`;
                    }
                  }}>
                    Pay Now
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
