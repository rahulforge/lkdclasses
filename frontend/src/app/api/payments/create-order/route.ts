import { NextRequest, NextResponse } from "next/server";
import { callCreatePaymentOrder } from "../_edge";
import { sbSelect, sbUpdate } from "../_utils";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { paymentId?: string };
    const paymentId = String(body?.paymentId ?? "").trim();
    if (!paymentId) {
      return NextResponse.json({ error: "paymentId is required" }, { status: 400 });
    }

    const rows = await sbSelect(
      "payments",
      `id=eq.${encodeURIComponent(paymentId)}&select=id,user_id,amount,status,provider,promo_code,provider_order_id&limit=1`
    );
    const payment = rows[0];
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const status = String(payment.status ?? "").toLowerCase();
    if (status === "success") {
      return NextResponse.json({
        alreadyPaid: true,
        paymentId,
      });
    }

    const edgeOrder = await callCreatePaymentOrder({
      order_only: true,
      amountInRupees: Number(payment.amount ?? 0),
      receipt: `pay_${paymentId}`,
      user_id: String(payment.user_id ?? ""),
      notes: {
        payment_id: paymentId,
        user_id: String(payment.user_id ?? ""),
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

    await sbUpdate("payments", `id=eq.${encodeURIComponent(paymentId)}`, {
      provider: "razorpay",
      provider_order_id: orderId,
    });

    const keyId = String(
      edgeOrder.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ""
    ).trim();

    return NextResponse.json({
      keyId,
      orderId,
      amount: Number(payment.amount ?? 0),
      currency: String(edgeOrder.currency ?? "INR"),
      paymentId,
      userId: String(payment.user_id ?? ""),
      promoCode: payment.promo_code ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
