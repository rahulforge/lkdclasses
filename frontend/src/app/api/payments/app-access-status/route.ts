import { NextRequest, NextResponse } from "next/server";
import { normalizePhone, sbSelect } from "../_utils";

export async function GET(req: NextRequest) {
  try {
    const phone = normalizePhone(req.nextUrl.searchParams.get("phone") ?? "");
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "Valid 10-digit phone is required" }, { status: 400 });
    }

    const rows = await sbSelect(
      "profiles",
      `phone=eq.${phone}&role=eq.student&select=id,name,phone,student_type,app_access_paid&limit=1`
    );
    const profile = rows[0];

    if (!profile?.id) {
      return NextResponse.json({
        exists: false,
        requiresPayment: false,
        admissionPaid: false,
      });
    }

    const studentType = String(profile.student_type ?? "online");
    const appAccessPaid = Boolean(profile.app_access_paid);
    const requiresPayment = studentType === "online" && !appAccessPaid;

    return NextResponse.json({
      exists: true,
      name: String(profile.name ?? ""),
      studentType,
      admissionPaid: appAccessPaid,
      requiresPayment,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to check app access status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
