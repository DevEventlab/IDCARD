import { readFile } from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { storagePath } from "@/lib/storage";

export async function readGenerationPdf(id: string, schoolId: string) {
  const batch = await prisma.batch.findFirst({
    where: { id, schoolId },
    select: { pdfKey: true },
  });
  if (!batch?.pdfKey) return null;
  try {
    return await readFile(storagePath(batch.pdfKey));
  } catch {
    return null;
  }
}
