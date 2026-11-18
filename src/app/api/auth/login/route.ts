import { NextResponse } from "next/server";
import { z } from "zod";
import { attachSessionCookie, createSession, rejectCrossOriginWrite, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inputSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  const originError = rejectCrossOriginWrite(request);
  if (originError) return originError;

  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Adresse e-mail ou mot de passe invalide." }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      include: {
        school: {
          select: {
            verificationStatus: true,
            _count: { select: { documents: true } },
          },
        },
      },
    });
    if (!user || !(await verifyPassword(parsed.data.password, user.password))) {
      return NextResponse.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
    }

    const next = user.isPlatformAdmin
      ? "/admin"
      : user.school?.verificationStatus === "APPROVED"
        ? "/app"
        : user.school?.verificationStatus === "PENDING_REVIEW" && user.school._count.documents > 0
          ? "/espace"
          : "/verification";
    const session = await createSession(user.id);
    return attachSessionCookie(NextResponse.json({ next }), session);
  } catch (error) {
    console.error("Login failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Connexion indisponible. Réessayez plus tard." }, { status: 503 });
  }
}
