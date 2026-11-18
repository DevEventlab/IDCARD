import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);
export const SESSION_COOKIE = "idcards_session";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

async function derivePassword(password: string, salt: string) {
  return (await scrypt(password, salt, 64)) as Buffer;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await derivePassword(password, salt);
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, expected] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !expected || !/^[a-f0-9]{128}$/i.test(expected)) return false;
  const actual = await derivePassword(password, salt);
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await prisma.session.create({ data: { tokenHash, userId, expiresAt } });
  return { token, expiresAt };
}

export async function getCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{40,50}$/.test(token)) return null;

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: { include: { school: true } } },
  });
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { tokenHash } });
    return null;
  }
  return session;
}

export function attachSessionCookie(
  response: NextResponse,
  session: { token: string; expiresAt: Date },
) {
  response.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function rejectCrossOriginWrite(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Origine de la requête invalide." }, { status: 403 });
  }
  return null;
}

export async function requireSchoolSession({ allowPending = false }: { allowPending?: boolean } = {}) {
  const session = await getCurrentSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: "Connexion requise." }, { status: 401 }) };
  }
  const school = session.user.school;
  if (session.user.isPlatformAdmin || !school) {
    return { session: null, response: NextResponse.json({ error: "Accès réservé à un compte école." }, { status: 403 }) };
  }
  if (!allowPending && school.verificationStatus !== "APPROVED") {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Le compte de l’établissement doit être validé avant d’utiliser cet espace.", verificationStatus: school.verificationStatus },
        { status: 403 },
      ),
    };
  }
  return { session, response: null };
}

export async function requireAdminSession() {
  const session = await getCurrentSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: "Connexion requise." }, { status: 401 }) };
  }
  if (!session.user.isPlatformAdmin) {
    return { session: null, response: NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 }) };
  }
  return { session, response: null };
}
