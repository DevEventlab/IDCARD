import { NextResponse } from "next/server";
import { CardFont } from "@prisma/client";
import { z } from "zod";
import { rejectCrossOriginWrite, requireSchoolSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schoolInput = z.object({
  name: z.string().trim().min(1).max(160),
  authority: z.string().trim().max(160).optional().default(""),
  motto: z.string().trim().max(200).optional().default(""),
  address: z.string().trim().max(300).optional().default(""),
  phone: z.string().trim().max(50).optional().default(""),
  cardHeader: z.string().trim().max(180).optional().default(""),
  cardBackText: z.string().trim().max(300).optional().default(""),
  signatoryName: z.string().trim().max(120).optional().default(""),
  signatoryTitle: z.string().trim().max(80).optional().default(""),
  cardFont: z.enum(["template", "sans", "serif"]).optional().default("template"),
  cardHeaderSize: z.number().int().min(12).max(22).optional().default(16),
  primary: z.string().regex(/^#[0-9a-f]{6}$/i),
  secondary: z.string().regex(/^#[0-9a-f]{6}$/i),
  templateDefault: z.string().trim().min(1).max(40),
  schoolYear: z.string().trim().max(20).optional().default(""),
});

function toClient(school: {
  id: string;
  name: string;
  authority: string | null;
  motto: string | null;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
  cardHeader: string | null;
  cardBackText: string | null;
  signatoryName: string | null;
  signatoryTitle: string | null;
  cardFont: CardFont;
  cardHeaderSize: number;
  primaryColor: string;
  secondaryColor: string;
  defaultTemplate: string;
  schoolYear: string | null;
}) {
  return {
    id: school.id,
    name: school.name,
    authority: school.authority ?? "",
    motto: school.motto ?? "",
    address: school.address ?? "",
    phone: school.phone ?? "",
    logoUrl: school.logoUrl ?? undefined,
    cardHeader: school.cardHeader ?? "",
    cardBackText: school.cardBackText ?? "",
    signatoryName: school.signatoryName ?? "",
    signatoryTitle: school.signatoryTitle ?? "",
    cardFont: school.cardFont === CardFont.SANS ? "sans" : school.cardFont === CardFont.SERIF ? "serif" : "template",
    cardHeaderSize: school.cardHeaderSize,
    primary: school.primaryColor,
    secondary: school.secondaryColor,
    templateDefault: school.defaultTemplate,
    schoolYear: school.schoolYear ?? "",
  };
}

export async function GET() {
  const access = await requireSchoolSession();
  if (access.response) return access.response;
  const schoolId = access.session.user.school?.id;
  if (!schoolId) return NextResponse.json({ school: null });
  try {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    return NextResponse.json({ school: school ? toClient(school) : null });
  } catch (error) {
    console.error("School settings read failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { error: "Base de données indisponible. Vérifiez DATABASE_URL et PostgreSQL." },
      { status: 503 },
    );
  }
}

export async function PUT(request: Request) {
  const originError = rejectCrossOriginWrite(request);
  if (originError) return originError;
  const access = await requireSchoolSession();
  if (access.response) return access.response;
  const parsed = schoolInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Informations d’école invalides." }, { status: 400 });

  const value = parsed.data;
  const schoolId = access.session.user.school?.id;
  if (!schoolId) return NextResponse.json({ error: "Établissement introuvable." }, { status: 404 });
  try {
    const school = await prisma.school.update({
      where: { id: schoolId },
      data: {
        name: value.name,
        authority: value.authority || null,
        motto: value.motto || null,
        address: value.address || null,
        phone: value.phone || null,
        cardHeader: value.cardHeader || null,
        cardBackText: value.cardBackText || null,
        signatoryName: value.signatoryName || null,
        signatoryTitle: value.signatoryTitle || null,
        cardFont: value.cardFont === "sans" ? CardFont.SANS : value.cardFont === "serif" ? CardFont.SERIF : CardFont.TEMPLATE,
        cardHeaderSize: value.cardHeaderSize,
        primaryColor: value.primary,
        secondaryColor: value.secondary,
        defaultTemplate: value.templateDefault,
        schoolYear: value.schoolYear || null,
      },
    });
    return NextResponse.json({ school: toClient(school) });
  } catch (error) {
    console.error("School settings update failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { error: "Impossible d’enregistrer l’école. Vérifiez la connexion PostgreSQL." },
      { status: 503 },
    );
  }
}
