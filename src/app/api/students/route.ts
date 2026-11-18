import { NextResponse } from "next/server";
import { requireSchoolSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return `${String(value.getUTCDate()).padStart(2, "0")}/${String(value.getUTCMonth() + 1).padStart(2, "0")}/${value.getUTCFullYear()}`;
}

export async function GET() {
  const access = await requireSchoolSession();
  if (access.response) return access.response;
  const schoolId = access.session.user.school?.id;
  if (!schoolId) return NextResponse.json({ error: "Établissement introuvable." }, { status: 404 });
  try {
    const [classes, students] = await Promise.all([
      prisma.class.findMany({
        where: { schoolId },
        orderBy: { name: "asc" },
        include: { _count: { select: { students: true } } },
      }),
      prisma.student.findMany({
        where: { schoolId },
        orderBy: [{ class: { name: "asc" } }, { nom: "asc" }, { prenoms: "asc" }],
        include: { class: true },
      }),
    ]);

    return NextResponse.json({
      classes: classes.map((item) => ({
        id: item.id,
        name: item.name,
        count: item._count.students,
      })),
      students: students.map((student) => ({
        id: student.id,
        matricule: student.matricule,
        nom: student.nom,
        prenoms: student.prenoms,
        dateNaissance: formatDate(student.dateNaissance),
        lieuNaissance: student.lieuNaissance ?? "",
        sexe: student.sexe,
        classe: student.class.name,
        classId: student.classId,
        anneeScolaire: student.anneeScolaire ?? "",
        photo: Boolean(student.photoKey),
        photoUrl: student.photoKey ? `/api/students/${student.id}/photo` : undefined,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Base de données indisponible. Vérifiez DATABASE_URL et PostgreSQL." },
      { status: 503 },
    );
  }
}
