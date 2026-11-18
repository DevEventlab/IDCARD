import { mkdir, writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rejectCrossOriginWrite, requireSchoolSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCardsPdf } from "@/lib/generate-cards-pdf";
import { storagePath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const templateIds = ["officiel", "numerique", "geometrique", "badge"] as const;

export async function GET() {
  const access = await requireSchoolSession();
  if (access.response) return access.response;
  const schoolId = access.session.user.school?.id;
  if (!schoolId) return NextResponse.json({ error: "Établissement introuvable." }, { status: 404 });
  try {
    const generations = await prisma.batch.findMany({
      where: { schoolId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { class: true },
    });
    return NextResponse.json({
      generations: generations.map((batch) => ({
        id: batch.id,
        date: batch.createdAt.toISOString(),
        classe: batch.class?.name ?? "Toute l’école",
        modele: batch.templateId,
        total: batch.total,
        statut: batch.status,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Base de données indisponible. Vérifiez DATABASE_URL et PostgreSQL." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const originError = rejectCrossOriginWrite(request);
  if (originError) return originError;
  const access = await requireSchoolSession();
  if (access.response) return access.response;
  const school = access.session.user.school;
  if (!school) return NextResponse.json({ error: "Établissement introuvable." }, { status: 404 });

  const parsed = z.object({
    classId: z.string().optional().nullable(),
    templateId: z.enum(templateIds),
    layout: z.enum(["single", "a4-sheet"]),
  }).safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Paramètres de génération invalides." }, { status: 400 });

  try {
    if (parsed.data.classId) {
      const studentClass = await prisma.class.findFirst({
        where: { id: parsed.data.classId, schoolId: school.id },
      });
      if (!studentClass)
        return NextResponse.json({ error: "Classe introuvable pour cette école." }, { status: 404 });
    }

    const students = await prisma.student.findMany({
      where: {
        schoolId: school.id,
        ...(parsed.data.classId ? { classId: parsed.data.classId } : {}),
      },
      include: { class: true },
      orderBy: [{ class: { name: "asc" } }, { nom: "asc" }, { prenoms: "asc" }],
    });
    if (!students.length)
      return NextResponse.json({ error: "Aucun élève à imprimer pour cette sélection." }, { status: 409 });

    const batch = await prisma.batch.create({
      data: {
        schoolId: school.id,
        classId: parsed.data.classId || null,
        templateId: parsed.data.templateId,
        layout: parsed.data.layout,
        status: "RUNNING",
        total: students.length,
      },
    });
    try {
      const pdf = await generateCardsPdf({
        students,
        school: {
          name: school.name,
          authority: school.authority ?? undefined,
          motto: school.motto ?? undefined,
          address: school.address ?? undefined,
          phone: school.phone ?? undefined,
          cardHeader: school.cardHeader ?? undefined,
          cardBackText: school.cardBackText ?? undefined,
          signatoryName: school.signatoryName ?? undefined,
          signatoryTitle: school.signatoryTitle ?? undefined,
          cardFont: school.cardFont === "SANS" ? "sans" : school.cardFont === "SERIF" ? "serif" : "template",
          cardHeaderSize: school.cardHeaderSize,
          primary: school.primaryColor,
          secondary: school.secondaryColor,
        },
        templateId: parsed.data.templateId,
        layout: parsed.data.layout,
      });
      await mkdir(storagePath("pdfs"), { recursive: true });
      const pdfKey = `pdfs/${batch.id}.pdf`;
      await writeFile(storagePath(pdfKey), pdf);
      await prisma.batch.update({
        where: { id: batch.id },
        data: { status: "DONE", pdfKey },
      });
      return new Response(new Uint8Array(pdf), {
        status: 201,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="cartes-${batch.id}.pdf"`,
          "Content-Length": String(pdf.length),
          "Cache-Control": "no-store",
          "X-Generation-Id": batch.id,
        },
      });
    } catch (error) {
      await prisma.batch.update({ where: { id: batch.id }, data: { status: "FAILED" } }).catch(() => undefined);
      console.error("Card PDF generation failed:", error instanceof Error ? error.message : "unknown error");
      return NextResponse.json({ error: "La création du PDF a échoué." }, { status: 500 });
    }
  } catch {
    return NextResponse.json(
      { error: "Base de données indisponible. Vérifiez DATABASE_URL et PostgreSQL." },
      { status: 503 },
    );
  }
}
