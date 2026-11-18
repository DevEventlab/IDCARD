import { NextResponse } from "next/server";
import { z } from "zod";
import { rejectCrossOriginWrite, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reviewSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  note: z.string().trim().max(1000).optional().default(""),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const originError = rejectCrossOriginWrite(request);
  if (originError) return originError;

  const access = await requireAdminSession();
  if (access.response) return access.response;
  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || (parsed.data?.decision === "reject" && !parsed.data.note)) {
    return NextResponse.json({ error: "Un motif est obligatoire pour refuser un dossier." }, { status: 400 });
  }

  try {
    const { id } = await params;
    const school = await prisma.school.findUnique({
      where: { id },
      select: { id: true, verificationStatus: true, _count: { select: { documents: true } } },
    });
    if (!school) return NextResponse.json({ error: "Établissement introuvable." }, { status: 404 });
    if (school.verificationStatus === "APPROVED") {
      return NextResponse.json({ error: "Cet établissement est déjà approuvé." }, { status: 409 });
    }
    if (parsed.data.decision === "approve" && school._count.documents === 0) {
      return NextResponse.json({ error: "Impossible de valider un dossier sans justificatif." }, { status: 409 });
    }

    const updated = await prisma.school.update({
      where: { id },
      data: {
        verificationStatus: parsed.data.decision === "approve" ? "APPROVED" : "REJECTED",
        verificationNote: parsed.data.decision === "reject" ? parsed.data.note : null,
      },
      select: { id: true, verificationStatus: true },
    });
    return NextResponse.json({ school: updated });
  } catch (error) {
    console.error("School verification review failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Impossible d’enregistrer la décision." }, { status: 503 });
  }
}
