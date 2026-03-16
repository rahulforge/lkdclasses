import { NextRequest, NextResponse } from "next/server";
import {
  getPlanByAmount,
  getPlanMap,
  monthKey,
  sbInsert,
  sbRpc,
  sbSelect,
  sbUpdate,
  verifyRazorpaySignature,
} from "../_utils";

function addMonthsIso(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + Math.max(1, months));
  return date.toISOString();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      paymentId?: string;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      razorpaySignature?: string;
      planId?: string;
    };

    const paymentId = String(body?.paymentId ?? "").trim();
    const razorpayPaymentId = String(body?.razorpayPaymentId ?? "").trim();
    const razorpayOrderId = String(body?.razorpayOrderId ?? "").trim();
    const razorpaySignature = String(body?.razorpaySignature ?? "").trim();

    if (!paymentId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
    }

    const valid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!valid) {
      await sbUpdate("payments", `id=eq.${encodeURIComponent(paymentId)}`, {
        status: "failed",
      });
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const paymentRows = await sbSelect(
      "payments",
      `id=eq.${encodeURIComponent(paymentId)}&select=id,user_id,amount,status,promo_code,provider_order_id&limit=1`
    );
    const payment = paymentRows[0];
    if (!payment?.id || !payment?.user_id) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    await sbUpdate("payments", `id=eq.${encodeURIComponent(paymentId)}`, {
      status: "success",
      provider: "razorpay",
      provider_order_id: razorpayOrderId,
      provider_payment_id: razorpayPaymentId,
    });

    const promoCode = String(payment.promo_code ?? "").trim().toUpperCase();
    const isAppAccess = promoCode === "APP_ACCESS";

    if (isAppAccess) {
      await sbUpdate(
        "profiles",
        `id=eq.${encodeURIComponent(String(payment.user_id))}`,
        {
          app_access_paid: true,
        }
      );

      await sbUpdate(
        "students",
        `user_id=eq.${encodeURIComponent(String(payment.user_id))}`,
        {
          app_access_paid: true,
        }
      );

      return NextResponse.json({
        success: true,
        paymentId,
        userId: String(payment.user_id),
        flow: "app_access",
      });
    }

    const planMap = await getPlanMap();
    const explicitPlan = body?.planId && planMap[String(body.planId)] ? planMap[String(body.planId)] : null;
    const inferredPlan = explicitPlan ?? (await getPlanByAmount(Number(payment.amount ?? 0)));
    const expiresAt = addMonthsIso(inferredPlan.months);

    const subRows = await sbSelect(
      "subscriptions",
      `user_id=eq.${encodeURIComponent(String(payment.user_id))}&select=user_id,plan_type&limit=1`
    );

    if (subRows.length > 0) {
      await sbUpdate(
        "subscriptions",
        `user_id=eq.${encodeURIComponent(String(payment.user_id))}`,
        {
          is_active: true,
          expires_at: expiresAt,
          plan_type: "online",
        }
      );
    } else {
      await sbInsert("subscriptions", {
        user_id: String(payment.user_id),
        is_active: true,
        expires_at: expiresAt,
        plan_type: "online",
      });
    }

    await sbUpdate(
      "profiles",
      `id=eq.${encodeURIComponent(String(payment.user_id))}`,
      {
        payment_status: "full_paid",
      }
    );

    await sbUpdate(
      "students",
      `user_id=eq.${encodeURIComponent(String(payment.user_id))}`,
      {
        payment_status: "full_paid",
        student_type: "online",
      }
    );

    const mKey = monthKey();
    const paidMonth = `${mKey}-01`;

    const studentRows = await sbSelect(
      "students",
      `user_id=eq.${encodeURIComponent(String(payment.user_id))}&select=roll_number&limit=1`
    );
    const rollNo = String(studentRows[0]?.roll_number ?? "").trim();

    if (rollNo) {
      try {
        await sbInsert("payment_tracking", {
          roll_number: rollNo,
          amount: Number(payment.amount ?? 0),
          status: "success",
          paid_month: paidMonth,
          paid_date: new Date().toISOString().slice(0, 10),
          payment_mode: "online",
        });
      } catch {
        // Ignore duplicate monthly entry conflict.
      }
    }

    return NextResponse.json({
      success: true,
      paymentId,
      userId: String(payment.user_id),
      expiresAt,
      flow: "content",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Payment verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
