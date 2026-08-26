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

## CMS / fallback behavior

The public website still reads deterministic fallback data from:

```text
shared/en.json
shared/ar.json
```

Social/contact fields are editable under `/admin/site` → **Social & contact**.

Fallbacks included in JSON:

```text
WhatsApp  -> temporary wa.me number
LinkedIn  -> linkedin.com
Instagram -> instagram.com
```

No MongoDB, Socket.IO, hosted CMS, or new external runtime service is added in this build. Those integrations remain deferred.

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
├── assets/
├── en.json
├── ar.json
├── content.ts
├── globals.css
├── types.tsx
├── auth.ts
└── store.ts
```

`app/loading.tsx` has intentionally been removed to satisfy KAN-13. `app/components/AP_Loader.tsx` stays available as a reusable component but is not used as a public entry screen.

## Jira state addressed by this frontend build

- **KAN-1** — Tailwind + Grid/Flex responsive redesign: implemented.
- **KAN-2** — CMS client navigation: existing App Router + `next/link` structure retained.
- **KAN-3** — Lazy loading: dynamic lower homepage modules and public overlays retained.
- **KAN-4** — Socket.IO: deferred.
- **KAN-5** — MongoDB/backend database: deferred.
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

Production admin credentials still come from Vercel environment variables:

```text
APEX_ADMIN_EMAIL
APEX_ADMIN_PASSWORD
APEX_ADMIN_SECRET
```
