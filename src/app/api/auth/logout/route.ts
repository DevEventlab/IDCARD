import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { clearSessionCookie, rejectCrossOriginWrite, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const originError = rejectCrossOriginWrite(request);
  if (originError) return originError;

  const token = request.headers.get("cookie")?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  if (token) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    try {
      await prisma.session.deleteMany({ where: { tokenHash } });
    } catch (error) {
      console.error("Session revocation failed:", error instanceof Error ? error.message : "unknown error");
      return NextResponse.json({ error: "Impossible de fermer la session. Réessayez." }, { status: 503 });
    }
  }
  const response = request.headers.get("accept")?.includes("text/html")
    ? NextResponse.redirect(new URL("/connexion", request.url), 303)
    : NextResponse.json({ ok: true });
  return clearSessionCookie(response);
}
