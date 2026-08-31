# Realtime CMS updates

Publishing from `/admin` updates open browsers immediately, without a redeploy.

## How it works

1. **Content is read at request time.** `getCmsContent()` reads through
   `shared/store.ts` — the same place the admin writes — instead of the JSON
   bundled at build time. The bundled JSON stays as a fallback if that read
   fails. Public pages set `dynamic = "force-dynamic"` so each request renders
   from current content.
2. **Publishing pushes an event.** `PUT /api/admin/content` calls
   `publishContentUpdate()`, which bumps a version and emits `content:updated`
   over Socket.IO.
3. **Open pages re-render.** `AP_LiveContent` (mounted in the root layout)
   listens for that event and calls `router.refresh()`, which re-fetches the
   server components in place. No full page reload, no lost scroll position.
4. **Reads are cached briefly.** `getCmsContent()` caches per locale, keyed on
   the content version with a 30s TTL. Publishing invalidates it at once. This
   matters in GitHub mode, where every uncached read is a GitHub API call.

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
refreshes when the version changes. Two caveats in that mode:

- Each serverless instance has its own version counter, so the 30s content
  cache TTL — not the push — is what makes an edit appear. Expect up to about
  45s rather than instant.
- For genuinely instant updates, deploy to a Node host that keeps a process
  alive (Railway, Render, Fly.io, a VPS) and run `npm run start`.

## Trade-off

Public pages are now server-rendered per request rather than static. That is
required for content to change without a rebuild, and it costs some TTFB
compared with a static page. The 30s cache keeps the store read off most
requests.
