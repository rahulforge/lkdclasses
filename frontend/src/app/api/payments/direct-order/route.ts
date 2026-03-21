import { NextRequest, NextResponse } from "next/server";
import { callCreatePaymentOrder } from "../_edge";
import {
  monthKey,
  getPlanMap,
  getPromoDiscount,
  normalizePhone,
  sbInsert,
  sbSelect,
  sbUpdate,
} from "../_utils";

const APP_ACCESS_FEE = Math.max(0, Number(process.env.APP_ACCESS_FEE ?? process.env.NEXT_PUBLIC_APP_ACCESS_FEE ?? 50));

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      phone?: string;
      planId?: string;
      promoCode?: string | null;
      registrationFee?: number;
      flow?: string;
    };

    const phone = normalizePhone(String(body?.phone ?? ""));
    const flow = String(body?.flow ?? "content").trim().toLowerCase();
    const isAppAccess = flow === "app_access";

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "Valid 10-digit phone is required" }, { status: 400 });
    }

    const profileRows = await sbSelect(
      "profiles",
      `phone=eq.${phone}&role=eq.student&select=id,name,phone,student_type,payment_status,admission_paid,app_access_paid&limit=1`
    );
    const profile = profileRows[0];
    if (!profile?.id) {
      return NextResponse.json({ error: "No student account found for this phone" }, { status: 404 });
    }

    const studentType = String(profile.student_type ?? "online");
    if (studentType === "offline") {
      return NextResponse.json({ error: "Offline students do not need online payment" }, { status: 400 });
    }

    let amount = 0;
    let planId = String(body?.planId ?? "monthly").trim();
    let registrationFee = 0;
    let baseAmount = 0;
    let subtotal = 0;
    let promoCode: string | null = null;
    let discountAmount = 0;
    let planMonths = 1;

    if (isAppAccess) {
      if (Boolean(profile.app_access_paid)) {
        return NextResponse.json({ alreadyPaid: true, paymentId: null, amount: 0, flow: "app_access" });
      }

      amount = APP_ACCESS_FEE;
      baseAmount = APP_ACCESS_FEE;
      subtotal = APP_ACCESS_FEE;
      promoCode = "APP_ACCESS";
      planId = "app_access";
      registrationFee = 0;
    } else {
      const planMap = await getPlanMap();
      if (!planMap[planId]) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }

      registrationFee = Math.max(0, Number(body?.registrationFee ?? 0));
      baseAmount = Number(planMap[planId].amount ?? 0);
      planMonths = Math.max(1, Number(planMap[planId].months ?? 1));
      subtotal = baseAmount + registrationFee;
      const promo = await getPromoDiscount(body?.promoCode, subtotal);
      promoCode = promo.code;
      discountAmount = Number(promo.discountAmount ?? 0);
      amount = Math.max(0, subtotal - discountAmount);

      if (amount <= 0) {
        const insertRows = await sbInsert("payments", {
          user_id: String(profile.id),
          amount: 0,
          status: "success",
          promo_code: promoCode,
          provider: "razorpay",
        });
        const payment = insertRows[0];
        if (!payment?.id) {
          return NextResponse.json({ error: "Unable to create payment" }, { status: 500 });
        }

        const expiresAt = (() => {
          const date = new Date();
          date.setMonth(date.getMonth() + Math.max(1, planMonths));
          return date.toISOString();
        })();

        const subRows = await sbSelect(
          "subscriptions",
          `user_id=eq.${encodeURIComponent(String(profile.id))}&select=user_id,plan_type&limit=1`
        );

        if (subRows.length > 0) {
          await sbUpdate(
            "subscriptions",
            `user_id=eq.${encodeURIComponent(String(profile.id))}`,
            {
              is_active: true,
              expires_at: expiresAt,
              plan_type: "online",
            }
          );
        } else {
          await sbInsert("subscriptions", {
            user_id: String(profile.id),
            is_active: true,
            expires_at: expiresAt,
            plan_type: "online",
          });
        }

        await sbUpdate(
          "profiles",
          `id=eq.${encodeURIComponent(String(profile.id))}`,
          {
            payment_status: "full_paid",
          }
        );

        await sbUpdate(
          "students",
          `user_id=eq.${encodeURIComponent(String(profile.id))}`,
          {
            payment_status: "full_paid",
            student_type: "online",
          }
        );

        const paidMonth = `${monthKey()}-01`;
        const studentRows = await sbSelect(
          "students",
          `user_id=eq.${encodeURIComponent(String(profile.id))}&select=roll_number&limit=1`
        );
        const rollNo = String(studentRows[0]?.roll_number ?? "").trim();

        if (rollNo) {
          try {
            await sbInsert("payment_tracking", {
              roll_number: rollNo,
              amount: 0,
              status: "success",
              paid_month: paidMonth,
              paid_date: new Date().toISOString().slice(0, 10),
              payment_mode: "online",
            });
          } catch {
            // ignore duplicate
          }
        }

        return NextResponse.json({
          alreadyPaid: true,
          paymentId: String(payment.id),
          amount: 0,
          currency: "INR",
          userId: String(profile.id),
          phone,
          planId,
          registrationFee,
          baseAmount,
          subtotal,
          discountAmount,
          finalAmount: 0,
          promoApplied: promoCode,
          promoValid: true,
          promoReason: "Promo covered full amount",
          flow: "content",
        });
      }
    }

    const insertRows = await sbInsert("payments", {
      user_id: String(profile.id),
      amount,
      status: "pending",
      promo_code: promoCode,
      provider: "razorpay",
    });

    const payment = insertRows[0];
    if (!payment?.id) {
      return NextResponse.json({ error: "Unable to create payment" }, { status: 500 });
    }

    const edgeOrder = await callCreatePaymentOrder({
      order_only: true,
      amountInRupees: amount,
      receipt: `pay_${payment.id}`,
      user_id: String(profile.id),
      notes: {
        payment_id: String(payment.id),
        user_id: String(profile.id),
        phone,
        flow: isAppAccess ? "app_access" : "content",
        plan_id: planId,
        registration_fee: String(registrationFee),
        base_amount: String(baseAmount),
        discount_amount: String(discountAmount),
        promo_code: promoCode ?? "",
      },
    });

    const orderId = String(
      edgeOrder.orderId ??
        edgeOrder.order_id ??
        edgeOrder.id ??
        edgeOrder.razorpay_order_id ??
        ""
    ).trim();
    if (!orderId) {
      return NextResponse.json({ error: "Invalid order response from edge function" }, { status: 500 });
    }

    await sbUpdate("payments", `id=eq.${encodeURIComponent(String(payment.id))}`, {
      provider: "razorpay",
      provider_order_id: orderId,
    });

    const keyId = String(
      edgeOrder.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ""
    ).trim();

    return NextResponse.json({
      keyId,
      orderId,
      amount,
      currency: String(edgeOrder.currency ?? "INR"),
      paymentId: String(payment.id),
      userId: String(profile.id),
      phone,
      planId,
      registrationFee,
      baseAmount,
      subtotal,
      discountAmount,
      finalAmount: amount,
      promoApplied: promoCode,
      promoValid: true,
      promoReason: null,
      flow: isAppAccess ? "app_access" : "content",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to create direct payment order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
