"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authService } from "@/services/authService";

const PENDING_REG_KEY = "lkd_pending_registration_v1";

type PendingRegistration = {
  fullName: string;
  fatherName: string;
  phone: string;
  whatsapp: string;
  village: string;
  selectedClass: string;
  paymentType: string;
  password: string;
  registrationFee?: number;
};

export default function RegisterFinalizePage() {
  const router = useRouter();
  const params = useSearchParams();
  const [statusText, setStatusText] = useState("Finalizing your registration...");
  const [error, setError] = useState("");
  const onceRef = useRef(false);

  useEffect(() => {
    if (onceRef.current) return;
    onceRef.current = true;

    const run = async () => {
      try {
        const status = String(params.get("status") ?? "").toLowerCase();
        const paymentId = String(params.get("payment_id") ?? "");
        const isFreeFlow = paymentId.startsWith("reg_free_");
        if (status !== "success" && !isFreeFlow) {
          throw new Error("Payment not successful. Please complete payment to create account.");
        }

        const raw = window.sessionStorage.getItem(PENDING_REG_KEY);
        if (!raw) {
          throw new Error("Registration details not found. Please register again.");
        }

        const payload = JSON.parse(raw) as PendingRegistration;
        await authService.registerStudent({
          fullName: payload.fullName,
          phone: payload.phone,
          selectedClass: payload.selectedClass,
          paymentType: payload.paymentType,
          password: payload.password,
          paymentConfirmed: true,
          admissionPaid: false,
          appAccessPaid: true,
          paidAmount: payload.registrationFee ?? undefined,
        });

        window.sessionStorage.removeItem(PENDING_REG_KEY);
        setStatusText("Registration completed. Please login.");
        setTimeout(() => router.replace("/login"), 1200);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unable to finalize registration";
        setError(msg);
        setStatusText("Registration not completed.");
      }
    };

    void run();
  }, [params, router]);

  return (
    <>
      <Navbar />
      <section className="py-28 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-center relative">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Registration Status</h1>
        <p className="text-lg md:text-xl opacity-90">{statusText}</p>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white rounded-t-[50%]" />
      </section>
      <section className="py-16 px-6 bg-white -mt-12 relative z-10 max-w-3xl mx-auto rounded-2xl shadow-lg">
        {error ? (
          <div className="text-red-600 text-center">
            <p className="font-semibold">{error}</p>
            <button
              className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg"
              onClick={() => router.replace("/register")}
            >
              Back to Register
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-700">Please wait...</p>
        )}
      </section>
      <Footer />
    </>
  );
}
