"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";
import {
  CLASS_OPTIONS,
  getAmountByClassAndPlan,
  getPlanCodeFromPaymentType,
  resolveClassLabel,
} from "@/config/coursePricing";

const APP_ACCESS_FEE = Math.max(0, Number(process.env.NEXT_PUBLIC_APP_ACCESS_FEE ?? 50));
const PENDING_REG_KEY = "lkd_pending_registration_v1";

function RegistrationPageContent() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [personal, setPersonal] = useState({
    fullName: "",
    fatherName: "",
    phone: "",
    whatsapp: "",
    sameWhatsapp: false,
    village: "",
    password: "",
    confirmPassword: "",
  });

  const [classInfo, setClassInfo] = useState({
    selectedClass: "",
    paymentType: "Monthly",
  });

  const searchParams = useSearchParams();
  const flowParam = (searchParams.get("flow") || "").trim().toLowerCase();
  const isAppAccessFlow = flowParam === "app_access";
  const registrationFee = APP_ACCESS_FEE;
  const prefillDoneRef = useRef(false);

  const planMap: Record<string, "Monthly" | "Half-Yearly" | "Yearly"> = {
    monthly: "Monthly",
    half_year: "Half-Yearly",
    yearly: "Yearly",
  };
  const classOptions = CLASS_OPTIONS;

  const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const extractNums = (value: string) =>
    (value.match(/\d+/g) ?? []).map((item) => Number(item)).filter((n) => Number.isFinite(n));

  const resolveClassFromInput = (input: string) => {
    const raw = input.trim();
    if (!raw) return "";
    if (!classOptions.length) return raw;

    const normalizedInput = normalizeText(raw);
    const exact = classOptions.find((cls) => normalizeText(cls) === normalizedInput);
    if (exact) return exact;

    const fuzzy = classOptions.find(
      (cls) =>
        normalizeText(cls).includes(normalizedInput) ||
        normalizedInput.includes(normalizeText(cls))
    );
    if (fuzzy) return fuzzy;

    // Map ranges from home cards (6 to 8 / 9 to 10 / 11 to 12) to first class in range
    if (normalizedInput.includes("6to8") || normalizedInput.includes("68")) return "Class 6";
    if (normalizedInput.includes("9to10") || normalizedInput.includes("910")) return "Class 9";
    if (normalizedInput.includes("11to12") || normalizedInput.includes("1112")) return "Class 11";

    const inputNums = extractNums(raw);
    if (inputNums.length) {
      const numMatch = classOptions.find((cls) => {
        const clsNums = extractNums(cls);
        if (!clsNums.length) return false;
        return clsNums[0] === inputNums[0];
      });
      if (numMatch) return numMatch;
    }

    return raw;
  };

  useEffect(() => {
    if (personal.sameWhatsapp) {
      setPersonal((prev) => ({ ...prev, whatsapp: prev.phone }));
    }
  }, [personal.sameWhatsapp, personal.phone]);

  useEffect(() => {
    if (prefillDoneRef.current) return;

    const selectedClassParam = (searchParams.get("class") || "").trim();
    const selectedPlanParam = (searchParams.get("plan") || "").trim().toLowerCase();
    const phoneParam = (searchParams.get("phone") || "").replace(/\D/g, "").slice(0, 10);

    if (/^\d{10}$/.test(phoneParam)) {
      setPersonal((prev) => ({
        ...prev,
        phone: prev.phone || phoneParam,
        whatsapp: prev.sameWhatsapp && !prev.whatsapp ? phoneParam : prev.whatsapp,
      }));
    }

    if (selectedClassParam) {
      const matchedClass = resolveClassLabel(resolveClassFromInput(selectedClassParam));
      setClassInfo((prev) => ({ ...prev, selectedClass: matchedClass }));
    }
    if (selectedPlanParam === "monthly") {
      setClassInfo((prev) => ({ ...prev, paymentType: "Monthly" }));
    }
    prefillDoneRef.current = true;
  }, [searchParams]);

  const validateStep = () => {
    if (step === 1) {
      if (!personal.fullName || !personal.fatherName || !personal.phone || !personal.village) {
        toast.error("All fields are required");
        return false;
      }
      if (!/^\d{10}$/.test(personal.phone)) {
        toast.error("Phone number must be 10 digits");
        return false;
      }
      if (!personal.password || personal.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
      }
      if (personal.password !== personal.confirmPassword) {
        toast.error("Password and confirm password must match");
        return false;
      }
      if (!personal.sameWhatsapp && !personal.whatsapp) {
        toast.error("WhatsApp number is required");
        return false;
      }
    }

    if (step === 2) {
      if (!classInfo.selectedClass) {
        toast.error("Please select class");
        return false;
      }
      const resolved = resolveClassFromInput(classInfo.selectedClass);
      if (!classOptions.includes(resolved)) {
        toast.error("Please select a valid class from list");
        return false;
      }
      if (resolved !== classInfo.selectedClass) {
        setClassInfo((prev) => ({ ...prev, selectedClass: resolved }));
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const resolvedClass = resolveClassLabel(resolveClassFromInput(classInfo.selectedClass));
      if (!resolvedClass || !classOptions.includes(resolvedClass)) {
        throw new Error("Please select a valid class");
      }
      const pendingPayload = {
        fullName: personal.fullName,
        fatherName: personal.fatherName,
        phone: personal.phone,
        whatsapp: personal.whatsapp,
        village: personal.village,
        selectedClass: resolvedClass,
        paymentType: classInfo.paymentType,
        password: personal.password,
        registrationFee,
      };
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(PENDING_REG_KEY, JSON.stringify(pendingPayload));
      }

      const redirectUrl = process.env.NEXT_PUBLIC_PAYMENT_URL;
      toast.success("Continue to payment. Registration fee is mandatory.");
      if (redirectUrl) {
        const planId = getPlanCodeFromPaymentType(classInfo.paymentType);
        const qs = new URLSearchParams({
          phone: personal.phone,
          class: resolvedClass,
          plan: planId,
          reg_fee: String(registrationFee),
          flow: "registration",
          return_url: `${window.location.origin}/register/finalize`,
        });
        window.location.href = `${redirectUrl}${redirectUrl.includes("?") ? "&" : "?"}${qs.toString()}`;
        return;
      }

      throw new Error("Payment URL is missing. Please set NEXT_PUBLIC_PAYMENT_URL");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to complete registration";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="py-28 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-center relative">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Register for Courses</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
          Fill your details, select class and subjects, and complete registration.
        </p>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white rounded-t-[50%]" />
      </section>

      <section className="py-20 px-6 md:px-12 bg-white -mt-12 relative z-10 max-w-3xl mx-auto rounded-2xl shadow-lg">
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">Step 1: Personal Details</h2>
            <input type="text" placeholder="Full Name *" value={personal.fullName} onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <input type="text" placeholder="Father's Name *" value={personal.fatherName} onChange={(e) => setPersonal({ ...personal, fatherName: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <input type="tel" placeholder="Phone Number *" value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create Password *"
                value={personal.password}
                onChange={(e) => setPersonal({ ...personal, password: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 text-sm font-semibold"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password *"
                value={personal.confirmPassword}
                onChange={(e) => setPersonal({ ...personal, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 text-sm font-semibold"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={personal.sameWhatsapp} onChange={(e) => setPersonal({ ...personal, sameWhatsapp: e.target.checked })} />
              <label>Use same number for WhatsApp</label>
            </div>
            {!personal.sameWhatsapp && (
              <input type="tel" placeholder="WhatsApp Number *" value={personal.whatsapp} onChange={(e) => setPersonal({ ...personal, whatsapp: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            )}
            <input type="text" placeholder="Village *" value={personal.village} onChange={(e) => setPersonal({ ...personal, village: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">Step 2: Class and Payment</h2>
            <select value={classInfo.selectedClass} onChange={(e) => setClassInfo({ ...classInfo, selectedClass: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="">-- Select Class --</option>
              {classInfo.selectedClass && !classOptions.includes(classInfo.selectedClass) && (
                <option value={classInfo.selectedClass}>{classInfo.selectedClass}</option>
              )}
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <div className="w-full px-4 py-3 border rounded-lg bg-indigo-50 text-indigo-700 font-semibold">
              Monthly Plan
            </div>
            <div className="text-sm bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <p><b>Selected Class:</b> {classInfo.selectedClass || "-"}</p>
              <p><b>Selected Plan:</b> {classInfo.paymentType || "-"}</p>
              <p><b>Monthly Fee (Pay in App):</b> Rs {getAmountByClassAndPlan(classInfo.selectedClass, classInfo.paymentType)}</p>
              <p><b>App Access Charge:</b> Rs {APP_ACCESS_FEE}</p>
              <p><b>Total Payable:</b> Rs {registrationFee}</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">Step 3: Summary and Payment</h2>
            <p><b>Full Name:</b> {personal.fullName}</p>
            <p><b>Father&apos;s Name:</b> {personal.fatherName}</p>
            <p><b>Phone:</b> {personal.phone}</p>
            <p><b>WhatsApp:</b> {personal.whatsapp}</p>
            <p><b>Village:</b> {personal.village}</p>
            <p><b>Class:</b> {classInfo.selectedClass}</p>
            <p><b>Subscription Plan:</b> {classInfo.paymentType} (Monthly fee pay later)</p>
            <p><b>Monthly Fee (Pay in App):</b> Rs {getAmountByClassAndPlan(classInfo.selectedClass, classInfo.paymentType)}</p>
            <p><b>App Access Charge:</b> Rs {APP_ACCESS_FEE}</p>
            <p><b>Total Payable:</b> Rs {registrationFee}</p>
            <p className="text-sm text-gray-600">Registration will be completed after successful online payment. Monthly fees are paid inside the app.</p>
            <div className="flex gap-4 mt-4">
              <button className="px-6 py-3 rounded-xl font-bold border bg-indigo-600 text-white">
                Pay Online (Required)
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-yellow-400 text-indigo-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform mt-4 disabled:opacity-60 animate-pulse"
            >
              {loading ? "Redirecting to Payment..." : "Pay and Complete Registration"}
            </button>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 && <button onClick={prevStep} className="px-6 py-2 rounded-lg border font-semibold hover:bg-gray-100 transition">Previous</button>}
          {step < 3 && <button onClick={nextStep} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">Next</button>}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <RegistrationPageContent />
    </Suspense>
  );
}
