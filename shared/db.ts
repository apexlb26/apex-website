import { MongoClient, type Collection, type Db, type ObjectId } from "mongodb";
import type { Locale, SiteContent } from "@/shared/types";

/*
 * MongoDB is the source of truth for everything the CMS can change: page copy
 * and labels, the image bytes themselves, and every list item (products, blog
 * posts, updates, career roles).
 *
 * The client is cached on globalThis because Next reloads modules in dev and
 * runs many isolated invocations in production - a new MongoClient per module
 * evaluation would open a new pool every time and exhaust the connection limit.
 */

const DEV_URI = "mongodb://127.0.0.1:27017";

export const DB_NAME = process.env.MONGODB_DB || "apex";

/** One document per locale holding all page copy and labels. */
export type ContentDoc = {
  _id: Locale;
  /** Everything except the list items, which live in `items`. */
  data: SiteContent;
  /** Bumped on every publish; used for optimistic concurrency. */
  version: number;
  updatedAt: Date;
  updatedBy?: string;
};

/**
 * The lists an editor can add to and delete from. They are stored as their own
 * documents rather than as arrays inside the content document so that two
 * editors working on different items cannot overwrite each other, and so a
 * delete is a delete rather than a whole-document rewrite.
 */
export type ItemKind = "product" | "post" | "update" | "role";

export const ITEM_KINDS: ItemKind[] = ["product", "post", "update", "role"];

export type ItemDoc = {
  _id: ObjectId;
  kind: ItemKind;
  locale: Locale;
  /** Display order within its kind; gaps are fine, only the sort matters. */
  order: number;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Image bytes live in the database as base64, per the storage decision for this
 * project: no filesystem writes, no second storage vendor. `/api/media/[id]`
 * decodes them back to binary so browsers can cache a normal image response
 * rather than re-downloading a data URI inlined into every page.
 */
export type MediaDoc = {
  _id: ObjectId;
  filename: string;
  contentType: string;
  /** Decoded byte length, not the base64 length. */
  size: number;
  base64: string;
  alt?: string;
  uploadedAt: Date;
  uploadedBy?: string;
};

/** A snapshot per publish. Replaces the git history the JSON/GitHub mode gave. */
export type RevisionDoc = {
  _id: ObjectId;
  locale: Locale;
  version: number;
  data: SiteContent;
  items: Pick<ItemDoc, "kind" | "order" | "data">[];
  savedAt: Date;
  savedBy?: string;
};

/** Server-side draft, replacing the per-browser localStorage draft. */
export type DraftDoc = {
  _id: Locale;
  data: SiteContent;
  savedAt: Date;
  savedBy?: string;
};

/** Contact enquiries, job applications and newsletter signups. */
export type SubmissionDoc = {
  _id: ObjectId;
  kind: "contact" | "application" | "subscribe";
  payload: Record<string, unknown>;
  receivedAt: Date;
  emailed: boolean;
};

/**
 * Small singletons. `content-version` is what the polling fallback compares,
 * and it lives here rather than in process memory so that every server - and
 * every serverless instance - agrees on it.
 */
export type StateDoc = {
  _id: string;
  value: string;
  at: Date;
};

export type ApexCollections = {
  content: Collection<ContentDoc>;
  items: Collection<ItemDoc>;
  media: Collection<MediaDoc>;
  revisions: Collection<RevisionDoc>;
  drafts: Collection<DraftDoc>;
  submissions: Collection<SubmissionDoc>;
  state: Collection<StateDoc>;
};

const globalRef = globalThis as typeof globalThis & {
  __apexMongo?: Promise<MongoClient>;
  __apexIndexes?: Promise<void>;
};

export function mongoUri(): string {
  const configured = process.env.MONGODB_URI?.trim();
  if (configured) return configured;
  // A local mongod is the normal dev setup; production must be explicit.
  if (process.env.NODE_ENV !== "production") return DEV_URI;
  throw new Error("MONGODB_URI is required in production.");
}

export function mongoConfigured(): boolean {
  try {
    mongoUri();
    return true;
  } catch {
    return false;
  }
}

function connect(): Promise<MongoClient> {
  if (!globalRef.__apexMongo) {
    const client = new MongoClient(mongoUri(), {
      // Fail fast rather than hanging a page render when the server is down;
      // the caller falls back to the bundled JSON snapshot.
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    globalRef.__apexMongo = client.connect().catch((error) => {
      // Clear the cache so the next request retries instead of reusing a
      // permanently rejected promise.
      globalRef.__apexMongo = undefined;
      throw error;
    });
  }
  return globalRef.__apexMongo;
}

export async function getDb(): Promise<Db> {
  const client = await connect();
  return client.db(DB_NAME);
}

export async function getCollections(): Promise<ApexCollections> {
  const db = await getDb();
  return {
    content: db.collection<ContentDoc>("content"),
    items: db.collection<ItemDoc>("items"),
    media: db.collection<MediaDoc>("media"),
    revisions: db.collection<RevisionDoc>("revisions"),
    drafts: db.collection<DraftDoc>("drafts"),
    submissions: db.collection<SubmissionDoc>("submissions"),
    state: db.collection<StateDoc>("state"),
  };
}

/**
 * Created once per process. Every index here is additive, so running this
 * against an existing database is safe.
 */
export function ensureIndexes(): Promise<void> {
  if (!globalRef.__apexIndexes) {
    globalRef.__apexIndexes = (async () => {
      const c = await getCollections();
      await Promise.all([
        c.items.createIndex({ locale: 1, kind: 1, order: 1 }),
        c.revisions.createIndex({ locale: 1, version: -1 }),
        c.media.createIndex({ uploadedAt: -1 }),
        c.submissions.createIndex({ receivedAt: -1 }),
      ]);
    })().catch((error) => {
      globalRef.__apexIndexes = undefined;
      throw error;
    });
  }
  return globalRef.__apexIndexes;
}
