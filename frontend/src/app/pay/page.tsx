"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { resolveClassLabel } from "@/config/coursePricing";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { contact?: string };
  notes?: Record<string, string>;
  handler: (response: RazorpaySuccessResponse) => Promise<void>;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
};

type OrderApiResponse = {
  error?: string;
  alreadyPaid?: boolean;
  keyId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  paymentId?: string;
  baseAmount?: number;
  subtotal?: number;
  discountAmount?: number;
  finalAmount?: number;
  promoApplied?: string | null;
  promoValid?: boolean;
  promoReason?: string | null;
};

type VerifyApiResponse = {
  success?: boolean;
  error?: string;
};

type PromoPreviewResponse = {
  error?: string;
  baseAmount?: number;
  registrationFee?: number;
  subtotal?: number;
  discountAmount?: number;
  total?: number;
  promoApplied?: string | null;
  promoValid?: boolean;
  promoReason?: string | null;
};

type DirectPlan = {
  id: string;
  label: string;
  amount: number;
  months: number;
};

const FALLBACK_PLANS: DirectPlan[] = [
  { id: "monthly", label: "Monthly", amount: 499, months: 1 },
  { id: "half_year", label: "6 Months", amount: 2499, months: 6 },
  { id: "yearly", label: "1 Year", amount: 4499, months: 12 },
];

function normalizePhone(input: string) {
  return input.replace(/\D/g, "").trim();
}

async function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function PayPageInner() {
  const params = useSearchParams();

  const paymentId = params.get("payment_id") || "";
  const returnUrl = params.get("return_url") || "";
  const planParam = params.get("plan") || "";
  const phoneParam = params.get("phone") || "";
  const flowParam = params.get("flow") || "";
  const classParam = params.get("class") || "";
  const promoParam = params.get("promo") || "";
  const regFeeParam = params.get("reg_fee") || "0";

  const [phone, setPhone] = useState("");
  const [plans, setPlans] = useState<DirectPlan[]>(FALLBACK_PLANS);
  const [plansLoading, setPlansLoading] = useState(true);
  const [planId, setPlanId] = useState<string>("monthly");
  const [promoCode, setPromoCode] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const registrationFee = Math.max(0, Number(regFeeParam || 0));
  const isRegistrationFlow = flowParam === "registration";
  const selectedClass = resolveClassLabel(classParam);
  const [priceInfo, setPriceInfo] = useState({
    baseAmount: FALLBACK_PLANS[0].amount,
    subtotal: FALLBACK_PLANS[0].amount + registrationFee,
    discountAmount: 0,
    total: FALLBACK_PLANS[0].amount + registrationFee,
    promoApplied: null as string | null,
    promoReason: "",
  });

  const isAppFlow = Boolean(paymentId);
  const autoStartRef = useRef(false);

  useEffect(() => {
    const loadPlans = async () => {
      setPlansLoading(true);
      try {
        if (isRegistrationFlow) {
          const planIdFallback = planParam || "monthly";
          setPlans([{ id: planIdFallback, label: "Registration", amount: 0, months: 0 }]);
        } else {
          const res = await fetch("/api/payments/plans", { cache: "no-store" });
          const json = (await res.json().catch(() => ({ plans: [] }))) as {
            plans?: DirectPlan[];
          };
          if (Array.isArray(json.plans) && json.plans.length > 0) {
            const onlinePlans = json.plans.filter((p) => p.id !== "monthly");
            setPlans(onlinePlans.length ? onlinePlans : json.plans);
            return;
          }
        }
        setPlans(FALLBACK_PLANS);
      } catch {
        setPlans(FALLBACK_PLANS);
      } finally {
        setPlansLoading(false);
      }
    };

    void loadPlans();
  }, [isRegistrationFlow, selectedClass, planParam]);

  useEffect(() => {
    if (phoneParam) {
      setPhone(normalizePhone(phoneParam));
    }
    if (planParam) {
      setPlanId(planParam);
    }
    if (promoParam && !isRegistrationFlow) {
      setPromoCode(promoParam.toUpperCase());
    }
  }, [phoneParam, planParam, promoParam, isRegistrationFlow]);

  useEffect(() => {
    if (!isRegistrationFlow || autoStartRef.current) return;
    if (!/^\d{10}$/.test(normalizePhone(phone))) return;
    autoStartRef.current = true;
    void handleCheckout();
  }, [isRegistrationFlow, phone]);

  useEffect(() => {
    if (!plans.length) return;
    const hasCurrent = plans.some((item) => item.id === planId);
    if (!hasCurrent) {
      setPlanId(plans[0].id);
    }
  }, [plans, planId]);

  const currentPlan = useMemo(() => plans.find((item) => item.id === planId) ?? plans[0], [plans, planId]);

  useEffect(() => {
    const baseAmount = isRegistrationFlow ? 0 : Number(currentPlan?.amount ?? 0);
    const subtotal = baseAmount + registrationFee;
    setPriceInfo((prev) => ({
      baseAmount,
      subtotal,
      discountAmount: 0,
      total: subtotal,
      promoApplied: null,
      promoReason: prev.promoApplied ? "Plan changed. Apply promo again." : "",
    }));
  }, [currentPlan, isRegistrationFlow, registrationFee]);

  const handleApplyPromo = async () => {
    try {
      setApplyingPromo(true);
      setError("");
      const res = await fetch("/api/payments/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          selectedClass,
          promoCode: promoCode.trim() || null,
          registrationFee,
        }),
      });
      const json = (await res.json()) as PromoPreviewResponse;
      if (!res.ok) {
        throw new Error(json.error || "Unable to apply promo");
      }
      setPriceInfo({
        baseAmount: Number(json.baseAmount ?? 0),
        subtotal: Number(json.subtotal ?? 0),
        discountAmount: Number(json.discountAmount ?? 0),
        total: Number(json.total ?? 0),
        promoApplied: json.promoApplied ?? null,
        promoReason: String(json.promoReason ?? ""),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unable to apply promo";
      setError(msg);
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Unable to load Razorpay checkout script");
      }

      const endpoint = isAppFlow
        ? "/api/payments/create-order"
        : isRegistrationFlow
          ? "/api/payments/registration-order"
          : "/api/payments/direct-order";
      const requestBody = isAppFlow
        ? { paymentId }
        : {
            phone: normalizePhone(phone),
            planId,
            selectedClass,
            promoCode: isRegistrationFlow ? null : promoCode.trim() || null,
            registrationFee,
          };

      if (!isAppFlow && !/^\d{10}$/.test(normalizePhone(phone))) {
        throw new Error("Enter valid 10-digit phone number");
      }

      const orderRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const orderJson = (await orderRes.json()) as OrderApiResponse;

      if (!orderRes.ok) {
        throw new Error(orderJson?.error || "Unable to create payment order");
      }

      if (orderJson?.alreadyPaid) {
        if (returnUrl) {
          const resolved = orderJson.paymentId || paymentId;
          const sep = returnUrl.includes("?") ? "&" : "?";
          window.location.href = `${returnUrl}${sep}payment_id=${encodeURIComponent(resolved)}&status=success`;
          return;
        }
        setMessage("Payment completed successfully.");
        return;
      }

      if (!orderJson.keyId || !orderJson.orderId || !orderJson.paymentId || !orderJson.amount) {
        throw new Error("Invalid order response from server");
      }
      setPriceInfo({
        baseAmount: Number(orderJson.baseAmount ?? currentPlan?.amount ?? 0),
        subtotal: Number(orderJson.subtotal ?? orderJson.amount ?? 0),
        discountAmount: Number(orderJson.discountAmount ?? 0),
        total: Number(orderJson.finalAmount ?? orderJson.amount ?? 0),
        promoApplied: orderJson.promoApplied ?? null,
        promoReason: String(orderJson.promoReason ?? ""),
      });
      const resolvedPaymentId = orderJson.paymentId;
      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) {
        throw new Error("Razorpay checkout is unavailable");
      }

      const options: RazorpayOptions = {
        key: orderJson.keyId,
        amount: Number(orderJson.amount) * 100,
        currency: orderJson.currency || "INR",
        name: "LKD Classes",
        description: isAppFlow ? "Subscription Payment" : `${currentPlan?.label ?? "Plan"} Plan`,
        order_id: orderJson.orderId,
        prefill: {
          contact: isAppFlow ? undefined : normalizePhone(phone),
        },
        notes: {
          payment_id: resolvedPaymentId,
        },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const verifyRes = await fetch(isRegistrationFlow ? "/api/payments/registration-verify" : "/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: resolvedPaymentId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                planId: isAppFlow || isRegistrationFlow ? undefined : planId,
              }),
            });
            const verifyJson = (await verifyRes.json()) as VerifyApiResponse;
            if (!verifyRes.ok || !verifyJson?.success) {
              throw new Error(verifyJson?.error || "Payment verification failed");
            }

            setMessage("Payment successful and verified.");
            if (returnUrl) {
              const sep = returnUrl.includes("?") ? "&" : "?";
              window.location.href = `${returnUrl}${sep}payment_id=${encodeURIComponent(resolvedPaymentId)}&status=success`;
              return;
            }
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Payment verification failed";
            setError(msg);
            if (returnUrl) {
              const sep = returnUrl.includes("?") ? "&" : "?";
              window.location.href = `${returnUrl}${sep}payment_id=${encodeURIComponent(resolvedPaymentId)}&status=failed`;
            }
          }
        },
        modal: {
          ondismiss: () => {
            if (returnUrl) {
              const sep = returnUrl.includes("?") ? "&" : "?";
              window.location.href = `${returnUrl}${sep}payment_id=${encodeURIComponent(resolvedPaymentId)}&status=cancelled`;
            }
          },
        },
        theme: {
          color: "#2563EB",
        },
      };

      const razor = new RazorpayCtor(options);
      razor.open();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unable to start checkout";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h1 className="text-2xl font-bold">Secure Payment</h1>
        <p className="mt-2 text-sm text-slate-400">
          {isAppFlow
            ? "Complete your app subscription payment securely via Razorpay."
            : isRegistrationFlow
              ? "Opening Razorpay to complete your registration payment."
              : "Pay directly from website using your registered student phone number."}
        </p>
        <p className="mt-3 text-xs text-slate-400 border border-slate-700 rounded-lg px-3 py-2">
          LKD Classes fee payment portal.
        </p>
        {!isAppFlow && registrationFee > 0 && (
          <p className="mt-2 text-xs text-amber-300">
            Includes one-time registration charge: Rs {registrationFee}
          </p>
        )}

        {!isAppFlow && (
          <div className="mt-6 space-y-4">
            {!isRegistrationFlow && (
              <div>
                <label className="mb-1 block text-xs text-slate-400">Phone Number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit phone"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            )}

            {!isRegistrationFlow && (
              <div>
                <label className="mb-1 block text-xs text-slate-400">Plan</label>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setPlanId(plan.id)}
                      className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                        planId === plan.id
                          ? "border-blue-500 bg-blue-500/20 text-blue-200"
                          : "border-slate-700 bg-slate-950 text-slate-300"
                      }`}
                    >
                      {plan.label}\nRs {plan.amount}
                    </button>
                  ))}
                </div>
                {plansLoading && <p className="mt-1 text-[11px] text-slate-500">Refreshing plans...</p>}
              </div>
            )}

            {!isRegistrationFlow && (
              <div>
                <label className="mb-1 block text-xs text-slate-400">Promo Code (optional)</label>
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="PROMO"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={applyingPromo}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {applyingPromo ? "..." : "Apply"}
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-slate-700 p-3 text-xs text-slate-300 space-y-1">
              {!isRegistrationFlow && <p>Plan Amount: Rs {priceInfo.baseAmount}</p>}
              <p>Registration Fee: Rs {registrationFee}</p>
              <p>Subtotal: Rs {priceInfo.subtotal}</p>
              <p>Discount: - Rs {priceInfo.discountAmount}</p>
              <p className="font-semibold text-white">Total Payable: Rs {priceInfo.total}</p>
              {priceInfo.promoApplied && !isRegistrationFlow && (
                <p className="text-emerald-400">Promo Applied: {priceInfo.promoApplied}</p>
              )}
              {!priceInfo.promoApplied && priceInfo.promoReason && !isRegistrationFlow && (
                <p className="text-amber-300">{priceInfo.promoReason}</p>
              )}
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {message && <p className="mt-4 text-sm text-emerald-400">{message}</p>}

        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading || (!isAppFlow && !currentPlan)}
          className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? "Please wait..." : isRegistrationFlow ? "Open Razorpay" : "Pay Securely"}
        </button>
      </div>
    </main>
  );
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
          <p className="text-sm text-slate-300">Loading payment...</p>
        </main>
      }
    >
      <PayPageInner />
    </Suspense>
  );
}


