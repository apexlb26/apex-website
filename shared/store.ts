import { ObjectId, type AnyBulkWriteOperation } from "mongodb";
import {
  ITEM_KINDS,
  ensureIndexes,
  getCollections,
  mongoConfigured,
  type ItemDoc,
  type ItemKind,
  type MediaDoc,
} from "@/shared/db";
import type {
  AdminMediaUploadResult,
  AdminSaveResult,
  BlogUpdate,
  CareerRole,
  InsightPost,
  Locale,
  ProductItem,
  SiteContent,
} from "@/shared/types";

/*
 * The CMS store. Everything an editor can change lives in MongoDB:
 *
 *   content      page copy and every label, one document per locale
 *   items        products, blog posts, updates and career roles - one
 *                document each, so they can be added and deleted
 *   media        image bytes, base64 encoded
 *   revisions    a snapshot per publish
 *   drafts       unpublished work, shared between editors
 *
 * `getContent()` stitches the items back into the shape the public components
 * already expect, so nothing downstream had to change when the lists moved out
 * of the content document.
 */

/** Where each item kind belongs once the content document is reassembled. */
const ITEM_SLOT: Record<ItemKind, [keyof SiteContent, string]> = {
  product: ["products", "items"],
  post: ["blogs", "posts"],
  update: ["blogs", "updates"],
  role: ["careers", "roles"],
};

export class ContentConflictError extends Error {
  constructor(public currentVersion: number) {
    super("This content was published by someone else while you were editing.");
    this.name = "ContentConflictError";
  }
}

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Merge the item documents back into the content document. */
function assemble(base: SiteContent, items: ItemDoc[]): SiteContent {
  const content = plain(base);
  for (const kind of ITEM_KINDS) {
    const [section, key] = ITEM_SLOT[kind];
    const target = content[section] as unknown as Record<string, unknown> | undefined;
    if (!target) continue;
    target[key] = items.filter((item) => item.kind === kind).map((item) => item.data);
  }
  return content;
}

/** Remove the item arrays before writing, so the content document cannot hold a stale copy. */
function stripItems(content: SiteContent): SiteContent {
  const stored = plain(content);
  for (const kind of ITEM_KINDS) {
    const [section, key] = ITEM_SLOT[kind];
    const target = stored[section] as unknown as Record<string, unknown> | undefined;
    if (target) delete target[key];
  }
  return stored;
}

/** Pull the item arrays out of an incoming content payload. */
function extractItems(content: SiteContent): Partial<Record<ItemKind, Record<string, unknown>[]>> {
  const found: Partial<Record<ItemKind, Record<string, unknown>[]>> = {};
  for (const kind of ITEM_KINDS) {
    const [section, key] = ITEM_SLOT[kind];
    const target = content[section] as unknown as Record<string, unknown> | undefined;
    const list = target?.[key];
    if (Array.isArray(list)) found[kind] = plain(list) as Record<string, unknown>[];
  }
  return found;
}

/**
 * Reconcile one kind's documents with the array the editor published.
 *
 * The editor already supports adding, reordering and removing these entries in
 * place, so it sends a plain array. Rather than replacing every document on
 * each publish, the existing document at each position is updated and only the
 * surplus is inserted or deleted - which keeps the collection stable and makes
 * a publish that changed one word touch one document.
 */
async function syncItemKind(locale: Locale, kind: ItemKind, list: Record<string, unknown>[]) {
  const c = await getCollections();
  const existing = await c.items.find({ locale, kind }).sort({ order: 1 }).toArray();
  const now = new Date();

  const operations: AnyBulkWriteOperation<ItemDoc>[] = [];

  list.forEach((data, order) => {
    const current = existing[order];
    if (current) {
      operations.push({ updateOne: { filter: { _id: current._id }, update: { $set: { data, order, updatedAt: now } } } });
    } else {
      operations.push({ insertOne: { document: { _id: new ObjectId(), kind, locale, order, data, createdAt: now, updatedAt: now } } });
    }
  });

  for (const surplus of existing.slice(list.length)) {
    operations.push({ deleteOne: { filter: { _id: surplus._id } } });
  }

  if (operations.length) await c.items.bulkWrite(operations);
}

export function getStorageMode(): "mongodb" | "fallback-json" {
  return mongoConfigured() ? "mongodb" : "fallback-json";
}

/**
 * Full content for a locale. Throws when the database is unreachable or has
 * not been seeded; callers fall back to the bundled JSON snapshot.
 */
export async function getContent(locale: Locale): Promise<SiteContent> {
  const c = await getCollections();
  const [doc, items] = await Promise.all([
    c.content.findOne({ _id: locale }),
    c.items.find({ locale }).sort({ kind: 1, order: 1 }).toArray(),
  ]);
  if (!doc) throw new Error(`No content in MongoDB for "${locale}". Run: npm run db:migrate`);
  return assemble(doc.data, items);
}

/** Content plus the version an editor needs in order to publish safely. */
export async function getContentWithVersion(locale: Locale): Promise<{ content: SiteContent; version: number }> {
  const c = await getCollections();
  const [doc, items] = await Promise.all([
    c.content.findOne({ _id: locale }),
    c.items.find({ locale }).sort({ kind: 1, order: 1 }).toArray(),
  ]);
  if (!doc) throw new Error(`No content in MongoDB for "${locale}". Run: npm run db:migrate`);
  return { content: assemble(doc.data, items), version: doc.version };
}

/**
 * Publish a locale.
 *
 * `expectedVersion` is optimistic concurrency: when two editors have the page
 * open, the second publish is rejected rather than silently overwriting the
 * first. Omit it only for scripted writes.
 */
export async function saveContent(
  locale: Locale,
  content: SiteContent,
  options: { expectedVersion?: number; updatedBy?: string } = {},
): Promise<AdminSaveResult> {
  await ensureIndexes();
  const c = await getCollections();

  const current = await c.content.findOne({ _id: locale });
  if (current && options.expectedVersion !== undefined && current.version !== options.expectedVersion) {
    throw new ContentConflictError(current.version);
  }

  const version = (current?.version ?? 0) + 1;
  const updatedAt = new Date();
  const normalized = { ...content, locale, direction: locale === "ar" ? "rtl" : "ltr" } satisfies SiteContent;
  const stored = stripItems(normalized);

  /*
   * Products, posts, updates and roles travel inside the payload because that
   * is how the editor manages them, but they are stored as their own
   * documents. Reconcile them first so a failure here does not leave the
   * content document claiming a change that the items never received.
   */
  const incoming = extractItems(normalized);
  for (const kind of ITEM_KINDS) {
    const list = incoming[kind];
    if (list) await syncItemKind(locale, kind, list);
  }

  await c.content.updateOne(
    { _id: locale },
    { $set: { data: stored, version, updatedAt, updatedBy: options.updatedBy } },
    { upsert: true },
  );

  /*
   * Snapshot after the write so a restore replays exactly what was published.
   * A failure here must not fail the publish - history is worth less than the
   * edit the user just made.
   */
  try {
    const items = await c.items.find({ locale }).sort({ kind: 1, order: 1 }).toArray();
    await c.revisions.insertOne({
      _id: new ObjectId(),
      locale,
      version,
      data: stored,
      items: items.map(({ kind, order, data }) => ({ kind, order, data })),
      savedAt: updatedAt,
      savedBy: options.updatedBy,
    });
  } catch (error) {
    console.error("Revision snapshot failed (content was still published):", error);
  }

  return { mode: "mongodb", updatedAt: updatedAt.toISOString(), version };
}

/* ------------------------------------------------------------------ items */

export async function listItems(locale: Locale, kind: ItemKind) {
  const c = await getCollections();
  const docs = await c.items.find({ locale, kind }).sort({ order: 1 }).toArray();
  return docs.map((doc) => ({ id: doc._id.toHexString(), order: doc.order, data: doc.data }));
}

/** Shapes used when an editor clicks "Add"; every field is editable afterwards. */
const ITEM_TEMPLATE: Record<ItemKind, () => Record<string, unknown>> = {
  product: () => ({ name: "New product", category: "Category", body: "", features: [], icon: "box", cta: "" } satisfies ProductItem as unknown as Record<string, unknown>),
  post: () => ({ category: "Insight", title: "New insight", body: "", date: "", readTime: "", image: "", href: "" } satisfies InsightPost as unknown as Record<string, unknown>),
  update: () => ({ category: "Update", date: "", title: "New update", body: "", cta: "", image: "", href: "" } satisfies BlogUpdate as unknown as Record<string, unknown>),
  role: () => ({ title: "New role", type: "Full-time", location: "Remote", summary: "", icon: "briefcase" } satisfies CareerRole as unknown as Record<string, unknown>),
};

export async function createItem(locale: Locale, kind: ItemKind, data?: Record<string, unknown>) {
  await ensureIndexes();
  const c = await getCollections();
  const last = await c.items.find({ locale, kind }).sort({ order: -1 }).limit(1).next();
  const now = new Date();
  const doc: ItemDoc = {
    _id: new ObjectId(),
    kind,
    locale,
    order: (last?.order ?? -1) + 1,
    data: data ?? ITEM_TEMPLATE[kind](),
    createdAt: now,
    updatedAt: now,
  };
  await c.items.insertOne(doc);
  return { id: doc._id.toHexString(), order: doc.order, data: doc.data };
}

export async function updateItem(id: string, data: Record<string, unknown>) {
  const c = await getCollections();
  const result = await c.items.updateOne({ _id: new ObjectId(id) }, { $set: { data, updatedAt: new Date() } });
  if (!result.matchedCount) throw new Error("That item no longer exists.");
}

export async function deleteItem(id: string) {
  const c = await getCollections();
  const result = await c.items.deleteOne({ _id: new ObjectId(id) });
  if (!result.deletedCount) throw new Error("That item no longer exists.");
}

/** Persist a new display order. `ids` is the full list for one kind, in order. */
export async function reorderItems(ids: string[]) {
  if (!ids.length) return;
  const c = await getCollections();
  await c.items.bulkWrite(
    ids.map((id, order) => ({ updateOne: { filter: { _id: new ObjectId(id) }, update: { $set: { order, updatedAt: new Date() } } } })),
  );
}

/* ------------------------------------------------------------------ media */

const ALLOWED_MEDIA = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
]);

/** Base64 inflates by 4/3, and a BSON document cannot exceed 16 MB. */
const MAX_MEDIA_BYTES = 8 * 1024 * 1024;

export async function uploadMedia(file: File, uploadedBy?: string): Promise<AdminMediaUploadResult> {
  if (!ALLOWED_MEDIA.has(file.type)) throw new Error("Only PNG, JPEG, WebP, GIF, and SVG files are allowed");
  if (file.size > MAX_MEDIA_BYTES) throw new Error("Maximum upload size is 8 MB");

  await ensureIndexes();
  const c = await getCollections();
  const bytes = Buffer.from(await file.arrayBuffer());

  const filename = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || `asset.${ALLOWED_MEDIA.get(file.type)}`;

  const doc: MediaDoc = {
    _id: new ObjectId(),
    filename,
    contentType: file.type,
    size: bytes.byteLength,
    base64: bytes.toString("base64"),
    uploadedAt: new Date(),
    uploadedBy,
  };
  await c.media.insertOne(doc);

  return { path: `/api/media/${doc._id.toHexString()}`, mode: "mongodb", id: doc._id.toHexString() };
}

export async function listMedia() {
  const c = await getCollections();
  // The bytes are deliberately excluded: a listing of 50 images should not
  // pull 50 base64 payloads into the admin page.
  const docs = await c.media
    .find({}, { projection: { base64: 0 } })
    .sort({ uploadedAt: -1 })
    .limit(200)
    .toArray();
  return docs.map((doc) => ({
    id: doc._id.toHexString(),
    path: `/api/media/${doc._id.toHexString()}`,
    filename: doc.filename,
    contentType: doc.contentType,
    size: doc.size,
    uploadedAt: doc.uploadedAt.toISOString(),
  }));
}

/** Returns the stored base64 plus what is needed to serve it as an image. */
export async function getMedia(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const c = await getCollections();
  const doc = await c.media.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  return { base64: doc.base64, contentType: doc.contentType, size: doc.size, uploadedAt: doc.uploadedAt };
}

export async function deleteMedia(id: string) {
  if (!ObjectId.isValid(id)) throw new Error("That image no longer exists.");
  const c = await getCollections();
  const result = await c.media.deleteOne({ _id: new ObjectId(id) });
  if (!result.deletedCount) throw new Error("That image no longer exists.");
}

/* ----------------------------------------------------------------- drafts */

export async function saveDraft(locale: Locale, content: SiteContent, savedBy?: string) {
  const c = await getCollections();
  const savedAt = new Date();
  await c.drafts.updateOne({ _id: locale }, { $set: { data: plain(content), savedAt, savedBy } }, { upsert: true });
  return savedAt.toISOString();
}

export async function getDraft(locale: Locale) {
  const c = await getCollections();
  const doc = await c.drafts.findOne({ _id: locale });
  return doc ? { data: doc.data, savedAt: doc.savedAt.toISOString(), savedBy: doc.savedBy } : null;
}

export async function clearDraft(locale: Locale) {
  const c = await getCollections();
  await c.drafts.deleteOne({ _id: locale });
}

/* -------------------------------------------------------------- revisions */

export async function listRevisions(locale: Locale, limit = 25) {
  const c = await getCollections();
  const docs = await c.revisions
    .find({ locale }, { projection: { data: 0, items: 0 } })
    .sort({ version: -1 })
    .limit(limit)
    .toArray();
  return docs.map((doc) => ({
    id: doc._id.toHexString(),
    version: doc.version,
    savedAt: doc.savedAt.toISOString(),
    savedBy: doc.savedBy,
  }));
}

/** Republishes an old snapshot as a new version, so the history stays append-only. */
export async function restoreRevision(id: string, restoredBy?: string): Promise<AdminSaveResult> {
  if (!ObjectId.isValid(id)) throw new Error("That revision no longer exists.");
  const c = await getCollections();
  const revision = await c.revisions.findOne({ _id: new ObjectId(id) });
  if (!revision) throw new Error("That revision no longer exists.");

  await c.items.deleteMany({ locale: revision.locale });
  if (revision.items.length) {
    const now = new Date();
    await c.items.insertMany(
      revision.items.map((item) => ({ _id: new ObjectId(), locale: revision.locale, createdAt: now, updatedAt: now, ...item })),
    );
  }
  return saveContent(revision.locale, revision.data, { updatedBy: restoredBy });
}

/* ------------------------------------------------------------ submissions */

/** Contact enquiries and applications were previously emailed and then lost. */
export async function recordSubmission(
  kind: "contact" | "application" | "subscribe",
  payload: Record<string, unknown>,
  emailed: boolean,
) {
  try {
    await ensureIndexes();
    const c = await getCollections();
    await c.submissions.insertOne({ _id: new ObjectId(), kind, payload, receivedAt: new Date(), emailed });
  } catch (error) {
    // Never fail a visitor's submission because the database is unavailable.
    console.error("Could not record submission:", error);
  }
}

export async function listSubmissions(limit = 100) {
  const c = await getCollections();
  const docs = await c.submissions.find({}).sort({ receivedAt: -1 }).limit(limit).toArray();
  return docs.map((doc) => ({
    id: doc._id.toHexString(),
    kind: doc.kind,
    payload: doc.payload,
    receivedAt: doc.receivedAt.toISOString(),
    emailed: doc.emailed,
  }));
}
