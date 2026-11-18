import path from "node:path";

export function storagePath(...parts: string[]) {
  return path.join(process.env.UPLOADS_DIR ?? path.join(process.cwd(), "storage"), ...parts);
}
