import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rejectCrossOriginWrite, requireSchoolSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storagePath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const photoPattern = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/;
const rowSchema = z.object({
  matricule: z.string().trim().min(1).max(80),
  nom: z.string().trim().min(1).max(120),
  prenoms: z.string().trim().min(1).max(160),
  dateNaissance: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
  lieuNaissance: z.string().max(160).optional().nullable(),
  sexe: z.enum(["F", "M"]),
  classe: z.string().trim().min(1).max(80),
  anneeScolaire: z.string().max(20).optional().nullable(),
  telephoneParent: z.string().max(50).optional().nullable(),
  photoDataUrl: z.string().optional(),
});

function parseDate(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null;
  return date;
}

export async function POST(request: Request) {
  const originError = rejectCrossOriginWrite(request);
  if (originError) return originError;
  const access = await requireSchoolSession();
  if (access.response) return access.response;
  const school = access.session.user.school;
  if (!school) return NextResponse.json({ error: "Établissement introuvable." }, { status: 404 });
  const schoolId = school.id;

  const body = await request.json().catch(() => null);
  const parsed = z.object({ rows: z.array(rowSchema).min(1).max(10000) }).safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Aucune ligne valide à importer." }, { status: 400 });

  const rows = parsed.data.rows;
  const seen = new Set<string>();
  const prepared = [];
  for (const row of rows) {
    const key = row.matricule.toLocaleLowerCase();
    if (seen.has(key))
      return NextResponse.json({ error: `Matricule en doublon dans le lot : ${row.matricule}.` }, { status: 409 });
    seen.add(key);
    const dateNaissance = parseDate(row.dateNaissance);
    if (!dateNaissance)
      return NextResponse.json({ error: `Date de naissance invalide pour ${row.matricule}.` }, { status: 400 });

    let photo: { bytes: Buffer; extension: string } | undefined;
    if (row.photoDataUrl) {
      const match = photoPattern.exec(row.photoDataUrl);
      if (!match)
        return NextResponse.json({ error: `Format de portrait invalide pour ${row.matricule}.` }, { status: 400 });
      const bytes = Buffer.from(match[2], "base64");
      if (!bytes.length || bytes.length > 2 * 1024 * 1024)
        return NextResponse.json({ error: `Le portrait de ${row.matricule} dépasse 2 Mo.` }, { status: 400 });
      photo = { bytes, extension: match[1] === "jpeg" ? "jpg" : "png" };
    }
    prepared.push({ ...row, dateNaissance, photo });
  }

  const writtenFiles: string[] = [];
  try {
    const existing = await prisma.student.findMany({
      where: { schoolId, matricule: { in: rows.map((row) => row.matricule) } },
      select: { matricule: true },
    });
    if (existing.length)
      return NextResponse.json(
        { error: `Matricules déjà présents : ${existing.map((item) => item.matricule).join(", ")}.` },
        { status: 409 },
      );

    const records = prepared.map((row) => ({
      ...row,
      id: randomUUID(),
      photoKey: row.photo ? `students/${randomUUID()}.${row.photo.extension}` : null,
    }));
    await mkdir(storagePath("students"), { recursive: true });
    for (const record of records) {
      if (!record.photo || !record.photoKey) continue;
      const filePath = storagePath(record.photoKey);
      await writeFile(filePath, record.photo.bytes, { flag: "wx" });
      writtenFiles.push(filePath);
    }

    await prisma.$transaction(async (transaction) => {
      for (const row of records) {
        const studentClass = await transaction.class.upsert({
          where: { schoolId_name: { schoolId, name: row.classe } },
          create: { schoolId, name: row.classe },
          update: {},
        });
        await transaction.student.create({
          data: {
            id: row.id,
            schoolId,
            classId: studentClass.id,
            matricule: row.matricule,
            nom: row.nom,
            prenoms: row.prenoms,
            dateNaissance: row.dateNaissance,
            lieuNaissance: row.lieuNaissance || null,
            sexe: row.sexe,
            anneeScolaire: row.anneeScolaire || school.schoolYear,
            telephoneParent: row.telephoneParent || null,
            photoKey: row.photoKey,
          },
        });
      }
    });

    return NextResponse.json({ imported: records.length }, { status: 201 });
  } catch {
    await Promise.all(writtenFiles.map((file) => unlink(file).catch(() => undefined)));
    return NextResponse.json(
      { error: "Import impossible. Vérifiez PostgreSQL, les doublons et le stockage des portraits." },
      { status: 503 },
    );
  }
}
