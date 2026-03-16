import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder, getRazorpayKeyId, sbSelect, sbUpdate } from "../_utils";

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

    const order = await createRazorpayOrder({
      amountInRupees: Number(payment.amount ?? 0),
      receipt: `pay_${paymentId}`,
      notes: {
        payment_id: paymentId,
        user_id: String(payment.user_id ?? ""),
      },
    });

    await sbUpdate(
      "payments",
      `id=eq.${encodeURIComponent(paymentId)}`,
      {
        provider: "razorpay",
        provider_order_id: order.id,
      }
    );

    return NextResponse.json({
      keyId: getRazorpayKeyId(),
      orderId: order.id,
      amount: Number(payment.amount ?? 0),
      currency: "INR",
      paymentId,
      userId: String(payment.user_id ?? ""),
      promoCode: payment.promo_code ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
