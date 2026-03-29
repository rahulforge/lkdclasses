import { NextRequest, NextResponse } from "next/server";
import { getChatResponse } from "@/lib/chat/orchestrator";
import { checkRateLimit } from "@/lib/chat/rate-limit";

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwardedFor?.split(",")[0]?.trim() || realIp || "anonymous";
}

export async function POST(request: NextRequest) {
  try {
    const clientKey = getClientKey(request);
    const limit = checkRateLimit(`chat:${clientKey}`, 15, 60_000);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please wait and try again.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": String(limit.remaining),
            "X-RateLimit-Reset": String(limit.resetAt),
          },
        }
      );
    }

    const body = await request.json();
    const query = typeof body?.message === "string" ? body.message.trim() : "";

    if (!query) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const result = await getChatResponse(query);

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Remaining": String(limit.remaining),
        "X-RateLimit-Reset": String(limit.resetAt),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process chat request";

    return NextResponse.json(
      {
        answer: `Please contact: ${process.env.NEXT_PUBLIC_INSTITUTE_PHONE || "+91 8002271522"}`,
        error: message,
        source: "fallback",
      },
      { status: 500 }
    );
  }
}
