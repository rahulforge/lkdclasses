import { NextResponse } from "next/server";
import { getActivePlans } from "../_utils";

export async function GET() {
  try {
    const plans = await getActivePlans();
    const onlinePlans = plans.filter((p) => p.id !== "monthly");
    return NextResponse.json({ plans: onlinePlans.length ? onlinePlans : plans });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to load plans";
    return NextResponse.json({ error: message, plans: [] }, { status: 500 });
  }
}
