import { NextResponse } from "next/server";
import { requireSchoolSession } from "@/lib/auth";
import { readGenerationPdf } from "@/lib/generation-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await requireSchoolSession();
  if (access.response) return access.response;
  const schoolId = access.session.user.school?.id;
  if (!schoolId) return NextResponse.json({ error: "Établissement introuvable." }, { status: 404 });
  try {
    const { id } = await params;
    const pdf = await readGenerationPdf(id, schoolId);
    if (!pdf) return NextResponse.json({ error: "PDF introuvable." }, { status: 404 });
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cartes-${id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "PDF introuvable." }, { status: 404 });
  }
}
