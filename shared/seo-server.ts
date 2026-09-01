import { promises as fs } from "fs";
import path from "path";
import type { Locale } from "@/shared/types";

export async function getContentLastModified(locale: Locale): Promise<Date> {
  if (process.env.MONGODB_URI) {
    try {
      const { getCollections } = await import("@/shared/db");
      const collections = await getCollections();
      const document = await collections.content.findOne({ _id: locale }, { projection: { updatedAt: 1 } });
      if (document?.updatedAt) return new Date(document.updatedAt);
    } catch (error) {
      console.warn(`Could not read ${locale} CMS updatedAt for sitemap; using bundled file timestamp.`, error);
    }
  }

  try {
    const stats = await fs.stat(path.join(process.cwd(), "shared", `${locale}.json`));
    return stats.mtime;
  } catch {
    return new Date("2026-09-01T00:00:00.000Z");
  }
}

export function contentDate(value?: string, fallback?: Date) {
  if (!value) return fallback;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp) : fallback;
}
