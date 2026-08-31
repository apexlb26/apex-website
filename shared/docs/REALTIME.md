# Realtime CMS updates

Publishing from `/admin` updates open browsers immediately, without a redeploy.
Labels, logos, images, products, posts and roles all travel the same path.

## How it works

1. **Content is read at request time.** `getCmsContent()` reads from MongoDB —
   the same database the admin writes to. Public pages set
   `dynamic = "force-dynamic"` so each request renders current content. React's
   `cache()` collapses the repeated reads within one render (the layout and the
   screen both ask for content) into a single round trip.
2. **Every change pushes an event.** Publishing content, adding or deleting an
   item, and uploading or deleting an image all call `publishContentUpdate()`,
   which bumps a version in the `state` collection and emits `content:updated`
   over Socket.IO.
3. **Open pages re-render.** `AP_LiveContent` (mounted in the root layout)
   listens for that event and calls `router.refresh()`, which re-fetches the
   server components in place. No full page reload, no lost scroll position.
4. **No cache to wait out.** Reads go straight to MongoDB, so a published change
   is live on the next render. The old 30s TTL existed because every read in
   GitHub mode was an API call against a rate limit; a database query is not.

## Running it

Socket.IO needs a connection that stays open, so it runs on a small custom
Node server that also serves Next:

```
npm run dev      # next dev + socket.io   (server.mjs)
npm run build
npm run start    # production + socket.io (server.mjs)
```

`server.mjs` mounts Socket.IO at `/api/socket`.

## Hosting

**Vercel's serverless functions cannot hold a WebSocket open**, so `server.mjs`
does not run there and the socket will not connect. The site still updates:
`AP_LiveContent` falls back to polling `/api/content/version` every 15s and
refreshes when the version changes.

That fallback is now reliable across instances. The version lives in MongoDB
rather than in process memory, so every serverless instance reads the same
value — previously each had its own counter and the poll could not see another
instance's publish. Expect up to about 15s in that mode rather than instant.

For genuinely instant updates, deploy to a Node host that keeps a process alive
(Railway, Render, Fly.io, a VPS) and run `npm run start`.

## Trade-off

Public pages are server-rendered per request rather than static. That is
required for content to change without a rebuild, and it costs some TTFB
compared with a static page. Each render is two indexed MongoDB queries (the
content document and its items), deduplicated per request.
