import { NextRequest, NextResponse } from "next/server";
import { getPromoDiscount } from "../_utils";
import { getAmountByClassAndPlan, resolveClassLabel } from "@/config/coursePricing";

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
    const baseAmount = getAmountByClassAndPlan(selectedClass, planId);
    const subtotal = baseAmount + registrationFee;
    const promo = await getPromoDiscount(body?.promoCode, subtotal);
    const total = Math.max(0, subtotal - promo.discountAmount);

    return NextResponse.json({
      baseAmount,
      registrationFee,
      subtotal,
      discountAmount: promo.discountAmount,
      total,
      promoApplied: promo.code,
      promoValid: promo.isValid,
      promoReason: promo.reason ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to validate promo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
