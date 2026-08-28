import type { Locale } from "@/shared/types";

/*
 * Shared between the browser and the server, so this module must stay free of
 * Node imports: `AP_LiveContent` is a client component and pulling the MongoDB
 * driver in through here would break the client bundle.
 */

export const CONTENT_UPDATED = "content:updated";

/** What changed. The client refreshes either way; this is for logging and future granularity. */
export type ContentChangeKind = "content" | "item" | "media" | "restore";

export type ContentUpdatedPayload = {
  locale: Locale;
  kind: ContentChangeKind;
  /** Changes whenever anything is published; the polling fallback compares it. */
  version: string;
  at: string;
};
