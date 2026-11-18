import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { requireSchoolSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storagePath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await requireSchoolSession();
  if (access.response) return access.response;
  const schoolId = access.session.user.school?.id;
  if (!schoolId) return NextResponse.json({ error: "Établissement introuvable." }, { status: 404 });
  try {
    const { id } = await params;
    const student = await prisma.student.findFirst({
      where: { id, schoolId },
      select: { photoKey: true },
    });
    if (!student?.photoKey)
      return NextResponse.json({ error: "Portrait introuvable." }, { status: 404 });
    const bytes = await readFile(storagePath(student.photoKey));
    const type = student.photoKey.endsWith(".png") ? "image/png" : "image/jpeg";
    return new Response(new Uint8Array(bytes), {
      headers: { "Content-Type": type, "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ error: "Portrait introuvable." }, { status: 404 });
  }
}
