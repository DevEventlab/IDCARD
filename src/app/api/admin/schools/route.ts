import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = await requireAdminSession();
  if (access.response) return access.response;

  const status = new URL(request.url).searchParams.get("status") ?? "pending";
  if (!["pending", "rejected", "approved", "all"].includes(status)) {
    return NextResponse.json({ error: "Filtre de statut invalide." }, { status: 400 });
  }

  try {
    const where = status === "pending"
      ? { verificationStatus: "PENDING_REVIEW" as const, documents: { some: {} } }
      : status === "rejected"
        ? { verificationStatus: "REJECTED" as const }
        : status === "approved"
          ? { verificationStatus: "APPROVED" as const }
          : {};

    const [schools, pendingSchools, counts] = await Promise.all([
      prisma.school.findMany({
        where,
        orderBy: { createdAt: "asc" },
        include: {
          users: { select: { name: true, email: true }, orderBy: { createdAt: "asc" } },
          _count: { select: { students: true, classes: true, documents: true } },
          documents: {
            orderBy: { createdAt: "desc" },
            select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true },
          },
        },
      }),
      prisma.school.findMany({
        where: { verificationStatus: "PENDING_REVIEW", documents: { some: {} } },
        select: {
          name: true,
          documents: { select: { id: true } },
        },
      }),
      Promise.all([
        prisma.school.count({ where: { verificationStatus: "PENDING_REVIEW", documents: { some: {} } } }),
        prisma.school.count({ where: { verificationStatus: "REJECTED" } }),
        prisma.school.count({ where: { verificationStatus: "APPROVED" } }),
      ]),
    ]);

    return NextResponse.json({
      schools: schools.map((school) => ({
        id: school.id,
        name: school.name,
        status: school.verificationStatus,
        note: school.verificationNote,
        authority: school.authority,
        motto: school.motto,
        phone: school.phone,
        address: school.address,
        logoUrl: school.logoUrl,
        cardHeader: school.cardHeader,
        cardBackText: school.cardBackText,
        signatoryName: school.signatoryName,
        signatoryTitle: school.signatoryTitle,
        cardFont: school.cardFont,
        cardHeaderSize: school.cardHeaderSize,
        primaryColor: school.primaryColor,
        secondaryColor: school.secondaryColor,
        defaultTemplate: school.defaultTemplate,
        schoolYear: school.schoolYear,
        counts: school._count,
        createdAt: school.createdAt.toISOString(),
        contact: school.users[0] ?? null,
        contacts: school.users,
        documents: school.documents.map((document) => ({
          ...document,
          createdAt: document.createdAt.toISOString(),
        })),
      })),
      pendingDocuments: pendingSchools.flatMap((school) =>
        school.documents.map((document) => ({ id: document.id, schoolName: school.name })),
      ),
      counts: { pending: counts[0], rejected: counts[1], approved: counts[2] },
    });
  } catch (error) {
    console.error("Verification queue read failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Impossible de charger la file de vérification." }, { status: 503 });
  }
}
