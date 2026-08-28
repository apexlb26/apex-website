/*
 * Seeds MongoDB from the bundled JSON snapshot.
 *
 * Run once when moving the site onto the database:
 *
 *   npm run db:migrate
 *   npm run db:migrate -- --force     # wipe and reseed
 *
 * What it does:
 *   1. Uploads every image the content references into `media` as base64.
 *   2. Rewrites those /api/assets/... paths to their new /api/media/<id>.
 *   3. Moves products, blog posts, blog updates and career roles out of the
 *      content blob into `items`, one document each, so they can be added to
 *      and deleted individually.
 *   4. Writes one `content` document per locale for everything else.
 *
 * It refuses to run against a database that already has content unless
 * --force is passed, so it cannot silently destroy live edits.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient, ObjectId } from "mongodb";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "apex";
const force = process.argv.includes("--force");

const LOCALES = ["en", "ar"];

/** Where each item kind is pulled from, and the kind it becomes. */
const ITEM_SOURCES = [
  { kind: "product", section: "products", key: "items" },
  { kind: "post", section: "blogs", key: "posts" },
  { kind: "update", section: "blogs", key: "updates" },
  { kind: "role", section: "careers", key: "roles" },
];

const MIME = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/** Every "/api/assets/..." string anywhere in the content tree. */
function collectAssetPaths(value, found = new Set()) {
  if (typeof value === "string") {
    if (value.startsWith("/api/assets/")) found.add(value);
    return found;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectAssetPaths(entry, found);
    return found;
  }
  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) collectAssetPaths(entry, found);
  }
  return found;
}

/** Replace asset paths with their new media URLs, everywhere they appear. */
function rewritePaths(value, mapping) {
  if (typeof value === "string") return mapping.get(value) ?? value;
  if (Array.isArray(value)) return value.map((entry) => rewritePaths(entry, mapping));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, rewritePaths(entry, mapping)]));
  }
  return value;
}

async function main() {
  // Atlas clusters can take a few seconds to wake, and the DNS lookup for a
  // +srv URI adds to that, so this is more patient than the app's own timeout.
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
  try {
    await client.connect();
  } catch (error) {
    console.error(`\nCould not reach MongoDB: ${error.message}\n`);
    if (uri.startsWith("mongodb+srv://")) {
      console.error("For Atlas, the two usual causes are:");
      console.error("  1. Your IP is not allowed. Atlas > Network Access > Add IP Address.");
      console.error("  2. Wrong user or password in the connection string. A password");
      console.error("     containing @ : / ? # [ ] must be percent-encoded.\n");
    }
    process.exit(1);
  }
  const db = client.db(dbName);
  console.log(`Connected to ${dbName} at ${uri.replace(/\/\/[^@]+@/, "//<credentials>@")}`);

  const content = db.collection("content");
  const items = db.collection("items");
  const media = db.collection("media");
  const state = db.collection("state");

  const existing = await content.countDocuments();
  if (existing && !force) {
    console.error(`\nRefusing to run: "content" already holds ${existing} document(s).`);
    console.error("Pass --force to wipe content, items and media and reseed from JSON.\n");
    await client.close();
    process.exitCode = 1;
    return;
  }

  if (force && existing) {
    /*
     * Revisions and drafts go too. They reference media ids and item sets that
     * this reseed deletes, so keeping them would leave restore points that
     * resurrect broken image paths. Submissions are real data and are kept.
     */
    console.log("--force: clearing content, items, media, revisions and drafts");
    await Promise.all([
      content.deleteMany({}),
      items.deleteMany({}),
      media.deleteMany({}),
      db.collection("revisions").deleteMany({}),
      db.collection("drafts").deleteMany({}),
    ]);
  }

  const snapshots = {};
  for (const locale of LOCALES) {
    snapshots[locale] = JSON.parse(await fs.readFile(path.join(root, "shared", `${locale}.json`), "utf8"));
  }

  /* 1 + 2 - images into the database, paths rewritten to point at them. */
  const referenced = new Set();
  for (const locale of LOCALES) collectAssetPaths(snapshots[locale], referenced);

  const mapping = new Map();
  for (const assetPath of [...referenced].sort()) {
    const relative = assetPath.replace(/^\/api\/assets\//, "");
    const file = path.join(root, "shared", "assets", relative);
    let bytes;
    try {
      bytes = await fs.readFile(file);
    } catch {
      console.warn(`  ! skipped ${assetPath} (file not found at shared/assets/${relative})`);
      continue;
    }
    const contentType = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
    const doc = {
      _id: new ObjectId(),
      filename: path.basename(file),
      contentType,
      size: bytes.byteLength,
      base64: bytes.toString("base64"),
      uploadedAt: new Date(),
      uploadedBy: "migration",
    };
    await media.insertOne(doc);
    mapping.set(assetPath, `/api/media/${doc._id.toHexString()}`);
    console.log(`  image ${assetPath} -> ${mapping.get(assetPath)} (${(bytes.byteLength / 1024).toFixed(0)} KB)`);
  }

  /* 3 + 4 - items into their own documents, the rest into content. */
  const now = new Date();
  for (const locale of LOCALES) {
    const data = rewritePaths(snapshots[locale], mapping);

    const itemDocs = [];
    for (const { kind, section, key } of ITEM_SOURCES) {
      const list = data[section]?.[key];
      if (!Array.isArray(list)) continue;
      list.forEach((entry, order) => {
        itemDocs.push({ _id: new ObjectId(), kind, locale, order, data: entry, createdAt: now, updatedAt: now });
      });
      // Removed from the blob so the content document cannot hold a stale copy.
      delete data[section][key];
    }
    if (itemDocs.length) await items.insertMany(itemDocs);

    const stored = { ...data, locale, direction: locale === "ar" ? "rtl" : "ltr" };

    await content.insertOne({
      _id: locale,
      data: stored,
      version: 1,
      updatedAt: now,
      updatedBy: "migration",
    });

    /*
     * Snapshot the seeded state as version 1. Without this the first publish is
     * the earliest restore point, so there is no way back to what the site
     * looked like before anyone edited it.
     */
    await db.collection("revisions").insertOne({
      _id: new ObjectId(),
      locale,
      version: 1,
      data: stored,
      items: itemDocs.map(({ kind, order, data: itemData }) => ({ kind, order, data: itemData })),
      savedAt: now,
      savedBy: "migration",
    });

    const counts = ITEM_SOURCES.map(({ kind }) => `${itemDocs.filter((d) => d.kind === kind).length} ${kind}s`).join(", ");
    console.log(`  ${locale}: content document written, items -> ${counts}`);
  }

  await state.updateOne({ _id: "content-version" }, { $set: { value: `${Date.now()}`, at: now } }, { upsert: true });

  await Promise.all([
    items.createIndex({ locale: 1, kind: 1, order: 1 }),
    media.createIndex({ uploadedAt: -1 }),
    db.collection("revisions").createIndex({ locale: 1, version: -1 }),
    db.collection("submissions").createIndex({ receivedAt: -1 }),
  ]);

  console.log("\nDone. MongoDB is now the source of truth.\n");
  await client.close();
}

main().catch((error) => {
  console.error("\nMigration failed:", error.message);
  process.exit(1);
});
