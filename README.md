# APEX — Reference Design + CMS-ready Website

This build implements the supplied APEX PDF direction as a real responsive Next.js website while preserving the existing `/admin` CMS architecture and JSON fallback model.

## Public design implemented

- Reference-style APEX header with centered navigation and compact build CTA.
- Two-column homepage hero with the APEX systems architecture visual, restrained interactive dot field, and responsive Flexbox/Grid behavior.
- No entry/loading screen. `AP_Loader.tsx` remains as a reusable component only and is not mounted by the public site.
- Trust/collaboration strip using real existing APEX content rather than invented client metrics.
- Solutions section rebuilt into the reference 3x2 capability-card layout.
- Dedicated `/solutions` page using the supplied Solutions PDF structure.
- Dedicated `/industries` page using the supplied mission-driven-industries structure.
- Home industries preview rebuilt into the same visual system.
- TutWithUs case study rebuilt around a device/product presentation without inventing quantitative outcomes.
- APEX method rebuilt as a centered five-step process timeline.
- Dedicated `/method` page with process, editorial themes, CTA, and full footer.
- `/blogs` rebuilt around the supplied editorial/milestones layout while remaining truthful when no posts exist.
- `/careers` rebuilt around the supplied careers layout: hero, team visual, values, roles, interest form shell, hiring process, and CTA.
- `/products` remains intentionally empty but now matches the same APEX visual system.
- Multi-column footer with LinkedIn, Instagram, and WhatsApp icons.
- Floating WhatsApp action remains functional with a temporary fallback number.

## CMS storage

**MongoDB is the source of truth.** Everything an editor can change lives in the
database: page copy and every label, image bytes (base64), products, blog posts,
blog updates, career roles, drafts, publish history and form submissions.

Nothing is written to the filesystem, and publishing no longer commits to
GitHub.

```powershell
npm.cmd run db:migrate    # seed the database from the JSON snapshot, once
```

See [DATABASE.md](DATABASE.md) for the collections, the publish flow, image
handling and rollback.

`shared/en.json` and `shared/ar.json` remain as a **read-only fallback**: if the
database is unreachable the public site renders the last shipped snapshot rather
than erroring. Nothing writes to them any more.

Social/contact fields are editable under `/admin/site` → **Social & contact**.

## Routes

```text
/               Home
/solutions      Solutions
/industries     Industries
/method         APEX Method
/products       Products
/blogs          Blog / updates
/careers        Careers
/admin          CMS
/admin/login    CMS login
```

## Architecture

```text
app/
├── components/       # one reusable AP_* component folder
├── screens/          # complete screen compositions
├── admin/            # admin routes
├── api/              # Next route handlers
├── solutions/
├── industries/
├── method/
├── products/
├── blogs/
├── careers/
├── layout.tsx
├── page.tsx
├── robots.ts
└── sitemap.ts

shared/
├── assets/           # build-time artwork; CMS images live in MongoDB
├── en.json           # read-only fallback snapshot
├── ar.json           # read-only fallback snapshot
├── db.ts             # MongoDB client, collections, document types
├── store.ts          # the CMS store: content, items, media, drafts, revisions
├── content.ts        # public read path, with the JSON fallback
├── realtime.ts       # version + Socket.IO push (server only)
├── events.ts         # event names shared with the browser
├── globals.css
├── types.tsx
└── auth.ts

scripts/
└── migrate-to-mongo.mjs
```

`app/loading.tsx` has intentionally been removed to satisfy KAN-13. `app/components/AP_Loader.tsx` stays available as a reusable component but is not used as a public entry screen.

## Jira state addressed by this frontend build

- **KAN-1** — Tailwind + Grid/Flex responsive redesign: implemented.
- **KAN-2** — CMS client navigation: existing App Router + `next/link` structure retained.
- **KAN-3** — Lazy loading: dynamic lower homepage modules and public overlays retained.
- **KAN-4** — Socket.IO: implemented (`server.mjs`, with a polling fallback).
- **KAN-5** — MongoDB/backend database: implemented (see [DATABASE.md](DATABASE.md)).
- **KAN-6** — SEO/GEO baseline: canonical metadata, schema, sitemap, robots retained and expanded for new routes.
- **KAN-7** — `apexlb.tech`: retained as canonical production target.
- **KAN-8** — WhatsApp floating action: implemented with CMS + JSON fallback.
- **KAN-9** — APEX assistant icon: retained as local guided UI only.
- **KAN-10** — LinkedIn / WhatsApp / Instagram: CMS fields + JSON fallback + footer links implemented.
- **KAN-11** — Careers page: rebuilt to the supplied reference structure.
- **KAN-12** — systems/3D visual: polished architecture stack retained in the reference hero.
- **KAN-13** — remove loading page: implemented.
- **KAN-14** — implement supplied PDF design: implemented across the public route set without fabricating business metrics.

## Apply this build over the existing Git repo

Use the included mirroring script instead of drag-copying over an older build:

```powershell
cd "C:\Users\charlie\Downloads\APEX-FINAL-REFERENCE-DESIGN"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
& ".\APPLY_TO_EXISTING_REPO.ps1" "C:\Users\charlie\Downloads\APEX-Ultra-Website-ULTRA"
```

Then:

```powershell
cd "C:\Users\charlie\Downloads\APEX-Ultra-Website-ULTRA"
$env:Path="C:\Program Files\nodejs;$env:Path"
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```

Test:

```text
http://localhost:3000
http://localhost:3000/solutions
http://localhost:3000/industries
http://localhost:3000/method
http://localhost:3000/blogs
http://localhost:3000/careers
http://localhost:3000/admin
```

When clean:

```powershell
git add -A
git commit -m "Implement APEX reference design across public site"
git push origin main
```

## Development-only admin fallback

```text
Email:    admin@apex.local
Password: apex-dev
```

Production requires these environment variables:

```text
MONGODB_URI          # local dev falls back to mongodb://127.0.0.1:27017
MONGODB_DB           # defaults to "apex"
APEX_ADMIN_EMAIL
APEX_ADMIN_PASSWORD
APEX_ADMIN_SECRET
```
