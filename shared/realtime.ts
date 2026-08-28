import { getCollections } from "@/shared/db";
import { CONTENT_UPDATED, type ContentChangeKind, type ContentUpdatedPayload } from "@/shared/events";
import type { Locale } from "@/shared/types";

export { CONTENT_UPDATED };
export type { ContentChangeKind, ContentUpdatedPayload };

/*
 * The Socket.IO server lives on the custom Node server (server.mjs). Route
 * handlers run in that same process, so they reach it through this global.
 * Where no persistent server exists (Vercel's serverless functions) there is
 * simply no instance here and clients fall back to polling
 * /api/content/version.
 *
 * The version itself is stored in MongoDB rather than in process memory, so
 * every instance agrees on it - that is what makes the polling fallback
 * correct when more than one instance is serving traffic.
 */
type Emitter = { emit: (event: string, payload: ContentUpdatedPayload) => void };

const VERSION_KEY = "content-version";

const globalRef = globalThis as typeof globalThis & { __apexIo?: Emitter };

export function setRealtimeServer(io: Emitter) {
  globalRef.__apexIo = io;
}

export async function getContentVersion(): Promise<string> {
  try {
    const c = await getCollections();
    const doc = await c.state.findOne({ _id: VERSION_KEY });
    return doc?.value ?? "0";
  } catch (error) {
    console.error("Could not read the content version:", error);
    return "0";
  }
}

/**
 * Called after any successful change - a publish, an item added or deleted, an
 * image uploaded or removed. Bumps the shared version and pushes to every open
 * page so a label, logo or picture updates without a reload.
 */
export async function publishContentUpdate(locale: Locale, kind: ContentChangeKind = "content"): Promise<ContentUpdatedPayload> {
  const payload: ContentUpdatedPayload = {
    locale,
    kind,
    version: `${Date.now()}`,
    at: new Date().toISOString(),
  };

  try {
    const c = await getCollections();
    await c.state.updateOne({ _id: VERSION_KEY }, { $set: { value: payload.version, at: new Date() } }, { upsert: true });
  } catch (error) {
    // The socket push below still reaches connected clients, so a version
    // write failure degrades the polling fallback rather than the feature.
    console.error("Could not persist the content version:", error);
  }

  globalRef.__apexIo?.emit(CONTENT_UPDATED, payload);
  return payload;
}
