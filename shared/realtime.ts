import type { Locale } from "@/shared/types";

export const CONTENT_UPDATED = "content:updated";

export type ContentUpdatedPayload = {
  locale: Locale;
  /** Changes whenever content is published; the polling fallback compares it. */
  version: string;
  at: string;
};

/*
 * The Socket.IO server lives on the custom Node server (server.mjs). Route
 * handlers run in that same process, so they reach it through this global.
 * When the app runs somewhere without a persistent server (Vercel's
 * serverless functions, for example) there is simply no instance here and
 * clients fall back to polling /api/content/version.
 */
type Emitter = { emit: (event: string, payload: ContentUpdatedPayload) => void };

const globalRef = globalThis as typeof globalThis & {
  __apexIo?: Emitter;
  __apexContentVersion?: string;
};

export function setRealtimeServer(io: Emitter) {
  globalRef.__apexIo = io;
}

export function getContentVersion(): string {
  return globalRef.__apexContentVersion ?? "0";
}

/** Called after a successful publish: bumps the version and pushes to clients. */
export function publishContentUpdate(locale: Locale): ContentUpdatedPayload {
  const payload: ContentUpdatedPayload = {
    locale,
    version: `${Date.now()}`,
    at: new Date().toISOString(),
  };
  globalRef.__apexContentVersion = payload.version;
  globalRef.__apexIo?.emit(CONTENT_UPDATED, payload);
  return payload;
}
