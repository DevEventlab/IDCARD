import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { attachSessionCookie, hashPassword, rejectCrossOriginWrite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inputSchema = z.object({
  schoolName: z.string().trim().min(2).max(160),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

function schoolSlug(name: string) {
  const base = name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "ecole";
  return `${base}-${randomBytes(4).toString("hex")}`;
}

export async function POST(request: Request) {
  const originError = rejectCrossOriginWrite(request);
  if (originError) return originError;

  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Vérifiez les informations saisies (mot de passe : 8 caractères minimum)." }, { status: 400 });
  }

  const { schoolName, name, email, password } = parsed.data;
  try {
    const passwordHash = await hashPassword(password);
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.$transaction(async (transaction) => {
      const legacySchool = await transaction.school.findUnique({
        where: { slug: "default-school" },
        include: { users: { select: { id: true }, take: 1 } },
      });
      const sameSchoolName = legacySchool?.name.trim().toLocaleLowerCase() === schoolName.trim().toLocaleLowerCase();
      const school = legacySchool && !legacySchool.users.length && sameSchoolName
        ? legacySchool
        : await transaction.school.create({ data: { name: schoolName, slug: schoolSlug(schoolName) } });
      const user = await transaction.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          password: passwordHash,
          schoolId: school.id,
        },
      });
      await transaction.session.create({ data: { tokenHash, userId: user.id, expiresAt } });
    });
    return attachSessionCookie(
      NextResponse.json({ next: "/verification" }, { status: 201 }),
      { token, expiresAt },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Un compte utilise déjà cette adresse e-mail." }, { status: 409 });
    }
    console.error("School registration failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Le service d’inscription est indisponible. Vérifiez la connexion à la base de données puis réessayez." }, { status: 503 });
  }
}
