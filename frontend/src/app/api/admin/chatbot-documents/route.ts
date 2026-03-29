import { NextRequest, NextResponse } from "next/server";
import { adminFetchTable, adminWriteTable, verifyAdminAccess } from "@/lib/chat/admin-auth";

type DocumentRecord = {
  id: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
  updated_at?: string;
};

function getBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  if (!header.toLowerCase().startsWith("bearer ")) return "";
  return header.slice(7).trim();
}

async function requireAdmin(request: NextRequest) {
  const token = getBearerToken(request);
  if (!token) {
    throw new Error("Missing authorization token");
  }
  await verifyAdminAccess(token);
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const rows = await adminFetchTable<DocumentRecord[]>(
      "documents",
      "select=id,slug,title,category,content,source,metadata,updated_at&order=updated_at.desc&limit=200"
    );
    return NextResponse.json({ documents: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load documents";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();

    const payload = {
      slug: String(body?.slug ?? "").trim(),
      title: String(body?.title ?? "").trim(),
      category: String(body?.category ?? "general").trim(),
      content: String(body?.content ?? "").trim(),
      source: String(body?.source ?? "admin").trim(),
      metadata: body?.metadata && typeof body.metadata === "object" ? body.metadata : {},
    };

    if (!payload.slug || !payload.title || !payload.content) {
      return NextResponse.json({ error: "slug, title and content are required" }, { status: 400 });
    }

    const rows = await adminWriteTable<DocumentRecord[]>("documents", "POST", "", payload);
    return NextResponse.json({ document: rows[0] ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const id = String(body?.id ?? "").trim();

    if (!id) {
      return NextResponse.json({ error: "Document id is required" }, { status: 400 });
    }

    const payload = {
      slug: String(body?.slug ?? "").trim(),
      title: String(body?.title ?? "").trim(),
      category: String(body?.category ?? "general").trim(),
      content: String(body?.content ?? "").trim(),
      source: String(body?.source ?? "admin").trim(),
      metadata: body?.metadata && typeof body.metadata === "object" ? body.metadata : {},
    };

    const rows = await adminWriteTable<DocumentRecord[]>(
      "documents",
      "PATCH",
      `id=eq.${encodeURIComponent(id)}`,
      payload
    );

    return NextResponse.json({ document: rows[0] ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim() || "";

    if (!id) {
      return NextResponse.json({ error: "Document id is required" }, { status: 400 });
    }

    await adminWriteTable<DocumentRecord[]>(
      "documents",
      "DELETE",
      `id=eq.${encodeURIComponent(id)}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
