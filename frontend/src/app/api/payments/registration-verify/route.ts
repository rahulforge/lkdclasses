import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "../_utils";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      razorpaySignature?: string;
    };

    const razorpayPaymentId = String(body?.razorpayPaymentId ?? "").trim();
    const razorpayOrderId = String(body?.razorpayOrderId ?? "").trim();
    const razorpaySignature = String(body?.razorpaySignature ?? "").trim();

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
    }

    const valid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!valid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Payment verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
