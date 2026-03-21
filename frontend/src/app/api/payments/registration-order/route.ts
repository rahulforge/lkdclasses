import { NextRequest, NextResponse } from "next/server";
import { callCreatePaymentOrder } from "../_edge";
import { getPromoDiscount } from "../_utils";
import { resolveClassLabel } from "@/config/coursePricing";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      planId?: string;
      selectedClass?: string;
      promoCode?: string | null;
      registrationFee?: number;
    };

    const planId = String(body?.planId ?? "monthly").trim();
    const selectedClass = resolveClassLabel(String(body?.selectedClass ?? ""));
    const registrationFee = Math.max(0, Number(body?.registrationFee ?? 0));

    const baseAmount = 0;
    const subtotal = registrationFee;
    const promo = await getPromoDiscount(body?.promoCode, subtotal);
    const finalAmount = Math.max(0, subtotal - promo.discountAmount);

    if (finalAmount <= 0) {
      return NextResponse.json({
        alreadyPaid: true,
        paymentId: `reg_free_${Date.now()}`,
        amount: 0,
        currency: "INR",
        baseAmount,
        subtotal,
        discountAmount: promo.discountAmount,
        finalAmount: 0,
        promoApplied: promo.code,
        promoValid: promo.isValid,
        promoReason: promo.reason ?? null,
        planId,
        selectedClass,
        registrationFee,
      });
    }

    const edgeOrder = await callCreatePaymentOrder({
      flow: "registration",
      class_value: selectedClass,
      amountInRupees: finalAmount,
      receipt: `reg_${Date.now()}`,
      notes: {
        flow: "registration",
        class: selectedClass,
        plan_id: planId,
        registration_fee: String(registrationFee),
        base_amount: String(baseAmount),
        discount_amount: String(promo.discountAmount),
        promo_code: promo.code ?? "",
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

    const keyId = String(
      edgeOrder.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ""
    ).trim();

    return NextResponse.json({
      keyId,
      orderId,
      amount: finalAmount,
      currency: String(edgeOrder.currency ?? "INR"),
      paymentId: `reg_${orderId}`,
      baseAmount,
      subtotal,
      discountAmount: promo.discountAmount,
      finalAmount,
      promoApplied: promo.code,
      promoValid: promo.isValid,
      promoReason: promo.reason ?? null,
      planId,
      selectedClass,
      registrationFee,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to create registration order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
