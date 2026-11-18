import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { attachSessionCookie, createSession, hashPassword, rejectCrossOriginWrite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inputSchema = z.object({
  token: z.string().min(1).max(512),
  email: z.string().trim().email().max(254),
  name: z.string().trim().min(2).max(120),
  password: z.string().min(12).max(128),
});

export async function POST(request: Request) {
  const originError = rejectCrossOriginWrite(request);
  if (originError) return originError;

  const configuredToken = process.env.PLATFORM_ADMIN_SETUP_TOKEN;
  if (!configuredToken) {
    return NextResponse.json({ error: "La création initiale de l’administrateur n’est pas configurée sur le serveur." }, { status: 503 });
  }

  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Informations invalides. Le mot de passe doit comporter au moins 12 caractères." }, { status: 400 });
  }

  const supplied = Buffer.from(parsed.data.token);
  const expected = Buffer.from(configuredToken);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ error: "Code de configuration incorrect." }, { status: 403 });
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.$transaction(async (transaction) => {
      if (await transaction.user.count({ where: { isPlatformAdmin: true } })) {
        throw new Error("ADMIN_ALREADY_CONFIGURED");
      }
      return transaction.user.create({
        data: {
          email: parsed.data.email.toLowerCase(),
          name: parsed.data.name,
          password: passwordHash,
          isPlatformAdmin: true,
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    const session = await createSession(user.id);
    return attachSessionCookie(NextResponse.json({ next: "/admin" }, { status: 201 }), session);
  } catch (error) {
    if (error instanceof Error && error.message === "ADMIN_ALREADY_CONFIGURED") {
      return NextResponse.json({ error: "Un compte administrateur est déjà configuré." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Cette adresse e-mail est déjà utilisée." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return NextResponse.json({ error: "Une configuration administrateur vient d’être effectuée. Reconnectez-vous." }, { status: 409 });
    }
    console.error("Platform administrator setup failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Configuration impossible. Réessayez plus tard." }, { status: 503 });
  }
}
