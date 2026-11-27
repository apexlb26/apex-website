/*
 * Pushes the newsroom cards from the JSON snapshot into MongoDB.
 *
 *   MONGODB_URI="mongodb+srv://..." npm run db:sync-blog          # report only
 *   MONGODB_URI="mongodb+srv://..." npm run db:sync-blog -- --yes # write
 *
 * Why this exists: MongoDB is the source of truth, so editing `shared/en.json`
 * alone changes the fallback and nothing else. The alternative is retyping
 * three cards' worth of fields into /admin twice (once per locale), which is
 * how typos get published.
 *
 * It is deliberately surgical. It writes only:
 *
 *   - the fields in SYNCED_FIELDS on the content document: the featured story
 *     and the category tabs
 *   - the `update` items whose copy changed, matched by their display order
 *
 * Everything else in the blogs section - the hero, the milestones, the insight
 * posts - is left exactly as the database has it, so a change made in /admin
 * since the migration is not quietly reverted.
 *
 * Publishing a new version afterwards bumps the shared content version, which
 * is what makes open pages re-render without a reload.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "apex";
const write = process.argv.includes("--yes");

const LOCALES = ["en", "ar"];
/*
 * Fields on the content document this sync owns. `featured` is the story the
 * panel shows by default, `categories` is the tab row - the first card files
 * under a tab that has to exist for the filter to find it - and `milestones`
 * is the sidebar list.
 */
const SYNCED_FIELDS = ["featured", "categories", "milestones"];

/** The cards this sync owns, by display order (0-based). */
const CARD_ORDERS = [0, 1, 2, 3];

if (!uri) {
  console.error("MONGODB_URI is required. Take it from Render -> apex-website -> Environment.");
  process.exit(1);
}

function describe(card) {
  return `${card.title} (${card.category}, ${card.date})`;
}

async function main() {
  // Atlas can take a few seconds to wake, and a +srv lookup adds to that.
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
  await client.connect();
  const db = client.db(dbName);
  const content = db.collection("content");
  const items = db.collection("items");
  const state = db.collection("state");

  let changed = false;

  try {
    for (const locale of LOCALES) {
      const snapshot = JSON.parse(await fs.readFile(path.join(root, "shared", `${locale}.json`), "utf8"));
      const doc = await content.findOne({ _id: locale });
      if (!doc) throw new Error(`No content document for "${locale}". Run npm run db:migrate first.`);

      console.log(`\n== ${locale} (version ${doc.version})`);

      /* -------------------------------------------- content-document fields */
      const fieldUpdates = {};
      for (const key of SYNCED_FIELDS) {
        const next = snapshot.blogs[key];
        if (next === undefined) continue;
        // Deep compare: `featured` and `categories` are a document and a list.
        if (JSON.stringify(doc.data?.blogs?.[key]) === JSON.stringify(next)) continue;
        fieldUpdates[`data.blogs.${key}`] = next;
        const shown = typeof next === "string" ? `"${next}"`
          : Array.isArray(next) ? next.map((item) => (typeof item === "string" ? item : item.title)).join(" | ")
          : `"${next.title ?? "(updated)"}"`;
        console.log(`   field  ${key} -> ${shown}`);
      }
      if (!Object.keys(fieldUpdates).length) console.log("   field  (already current)");

      /* ----------------------------------------------------------- cards */
      const existing = await items.find({ locale, kind: "update" }).sort({ order: 1 }).toArray();
      const snapshotCards = snapshot.blogs.updates ?? [];

      if (existing.length !== snapshotCards.length) {
        throw new Error(
          `${locale}: the database holds ${existing.length} update cards but the snapshot has ${snapshotCards.length}. ` +
          "Reconcile them in /admin first - this script will not guess which card is which.",
        );
      }

      const cardWrites = [];
      for (const order of CARD_ORDERS) {
        const target = existing[order];
        const next = snapshotCards[order];
        if (!target || !next) throw new Error(`${locale}: no card at position ${order + 1}.`);
        console.log(`   card ${order + 1}  "${target.data?.title ?? "?"}"\n           -> ${describe(next)}`);
        cardWrites.push({ updateOne: { filter: { _id: target._id }, update: { $set: { data: next, updatedAt: new Date() } } } });
      }

      if (!write) continue;

      if (cardWrites.length) await items.bulkWrite(cardWrites);
      await content.updateOne(
        { _id: locale },
        { $set: { ...fieldUpdates, version: doc.version + 1, updatedAt: new Date(), updatedBy: "sync-blog-cards" } },
      );
      changed = true;
      console.log(`   written (version ${doc.version} -> ${doc.version + 1})`);
    }

    if (!write) {
      console.log("\nReport only. Re-run with --yes to write these changes.");
      return;
    }

    if (changed) {
      // What the polling fallback compares, and what the socket push carries.
      const version = `${Date.now()}`;
      await state.updateOne({ _id: "content-version" }, { $set: { value: version, at: new Date() } }, { upsert: true });
      console.log(`\nDone. Content version bumped to ${version}; open pages will pick it up.`);
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("\nSync failed:", error.message);
  process.exitCode = 1;
});
