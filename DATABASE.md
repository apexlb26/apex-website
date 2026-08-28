# MongoDB CMS storage

Everything the CMS can change lives in MongoDB. Nothing is written to the
filesystem, and publishing no longer commits to GitHub.

## Setup

```powershell
# 1. Point at a database (local dev defaults to mongodb://127.0.0.1:27017)
#    Set MONGODB_URI in .env.local, or leave it unset for a local mongod.

# 2. Seed it from the JSON snapshot - once
npm.cmd run db:migrate

# 3. Run
npm.cmd run dev
```

`db:migrate` refuses to run against a database that already holds content.
Pass `--force` to wipe `content`, `items` and `media` and reseed:

```powershell
npm.cmd run db:migrate -- --force
```

## Collections

| Collection    | Holds                                                       |
| ------------- | ----------------------------------------------------------- |
| `content`     | One document per locale: all page copy and every label       |
| `items`       | Products, blog posts, blog updates, career roles - one each  |
| `media`       | Image bytes, base64 encoded, plus type and size              |
| `drafts`      | Unpublished work, one per locale, shared between editors     |
| `revisions`   | A snapshot per publish                                       |
| `submissions` | Contact enquiries, job applications, newsletter signups      |
| `state`       | The content version the polling fallback compares            |

### Why items are separate documents

`products.items`, `blogs.posts`, `blogs.updates` and `careers.roles` are stored
as individual documents rather than as arrays inside the content document, so
adding and deleting are real operations and two editors working on different
items cannot overwrite each other.

The editor still sends them as arrays, because that is how its add / reorder /
remove controls already worked. `saveContent()` reconciles that array against
the collection - updating the document at each position, inserting what is new,
deleting the surplus - and `getContent()` stitches them back into the shape the
public components expect. Nothing in `app/components` had to change.

### Images

Image bytes are base64 in the `media` collection. `/api/media/<id>` decodes them
back to binary and serves a normal image response.

Serving them through that route rather than inlining `data:` URIs into the page
is deliberate: the browser caches the URL, revalidates with an ETag, and the
HTML stays small. Inlined data URIs would re-send every image on every render
and defeat caching entirely.

An id always refers to the same bytes - replacing an image creates a new
document with a new id - so responses are cached with `immutable`.

Limit is 8 MB per image. A BSON document cannot exceed 16 MB and base64 inflates
by a third, which is what sets the ceiling.

## Publish flow

1. The editor loads content plus its `version`.
2. Publish sends both. If the stored version has moved on, the write is rejected
   with `409` and the editor offers to reload rather than silently overwriting
   the other person's work.
3. Items are reconciled, then the content document is written, then the whole
   locale is snapshotted into `revisions`.
4. `publishContentUpdate()` bumps `state.content-version` and emits over
   Socket.IO, so open pages re-render immediately.

## History and rollback

Under the previous JSON/GitHub model every publish was a git commit, so history
and rollback came free. Moving to a database would have lost that, so each
publish snapshots the locale into `revisions` instead.

`POST /api/admin/revisions` with a revision id restores it. A restore republishes
the snapshot as a **new** version rather than rewinding the counter, which keeps
history append-only and makes an unwanted restore itself undoable.

## If the database is down

`getCmsContent()` falls back to the JSON bundled at build time
(`shared/en.json`, `shared/ar.json`), so the public site keeps rendering the
last shipped content instead of erroring. Those files are a read-only floor -
nothing writes to them any more, and edits made since the migration will not be
in them.

The admin will not load or publish without the database, which is intended:
editing a copy nobody can save is worse than a clear failure.

## Form submissions

Contact enquiries, job applications (including the CV, base64) and newsletter
signups are stored in `submissions` before the notification email is attempted,
with an `emailed` flag recording whether delivery succeeded. Previously a mail
outage lost the submission outright.
