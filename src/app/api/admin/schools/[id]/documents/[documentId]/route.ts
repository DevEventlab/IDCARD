import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storagePath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  const access = await requireAdminSession();
  if (access.response) return access.response;

  const { id, documentId } = await params;
  try {
    const document = await prisma.schoolDocument.findFirst({
      where: { id: documentId, schoolId: id },
    });
    if (!document) return NextResponse.json({ error: "Justificatif introuvable." }, { status: 404 });

    const bytes = await readFile(storagePath(document.storageKey));
    const filename = encodeURIComponent(document.originalName);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Verification document read failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Le justificatif est temporairement inaccessible." }, { status: 503 });
  }
}
