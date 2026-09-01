# APEX SEO + GEO Final Implementation Notes

Implemented against the 1 September 2026 SEO/GEO audit for apexlb.tech.

## Included in code

- Existing SEO fundamentals preserved: canonical metadata, robots, OpenGraph/Twitter, sitemap, Organization/WebSite/OfferCatalog/Service graph.
- Organization upgraded to `Organization` + `ProfessionalService`.
- Lebanon business signals added: telephone, Beirut locality, LB country, regional `areaServed`, English/Arabic language support and sales `ContactPoint`.
- Exact street address, postal code and coordinates are supported through environment variables instead of invented values.
- `areaServed: "Global"` is removed from the structured data and replaced with LB / AE / SA.
- Generic LinkedIn/Instagram platform-home URLs are filtered out of `sameAs`; real profile URLs will be emitted automatically once the CMS contains them.
- Arabic content is published at `/ar` plus Arabic equivalents for Solutions, Industries, Method, Products, Blogs and Careers. All read `shared/ar.json` / the Arabic CMS document, receive `lang="ar"` / `dir="rtl"` through request-locale middleware, and use en/ar/x-default language alternates.
- Sitemap now includes English and Arabic route sets, `/faq`, English/Arabic individual blog URLs, and `lastModified` values sourced from MongoDB `updatedAt` when configured, with bundled-file timestamps as fallback.
- Individual blog/update URLs live at `/blogs/[slug]` and emit `BlogPosting` + breadcrumb structured data.
- Blog cards link to canonical individual URLs.
- Author schema is `Person` only when a real author value exists; otherwise it correctly falls back to the APEX Organization rather than inventing a person.
- `/faq` exposes six visible, site-grounded questions and matching `FAQPage` structured data.
- Route-level generated OpenGraph cards are available from `/api/og`, giving pages distinct social previews instead of one shared hero image.
- English/Arabic bundled JSON files are normalized to UTF-8 without BOM during patch application.

## Exact local-address configuration

Set these only to real APEX business details before production deployment:

```env
APEX_ADDRESS_STREET=REAL STREET / BUILDING
APEX_ADDRESS_LOCALITY=Beirut
APEX_ADDRESS_REGION=Beirut
APEX_ADDRESS_POSTAL_CODE=REAL POSTAL CODE
APEX_GEO_LATITUDE=REAL LATITUDE
APEX_GEO_LONGITUDE=REAL LONGITUDE
```

The code intentionally does not fabricate a street address or coordinates.

## Manual SEO/GEO tasks still requiring company accounts or verified details

1. Put the real APEX LinkedIn and Instagram profile URLs in the CMS. Do not use platform home pages.
2. Claim/verify the Google Business Profile with the exact same legal business name, phone and real physical address used in schema.
3. Add/verify apexlb.tech in Google Search Console and Bing Webmaster Tools and submit the sitemap.
4. After deployment, validate representative URLs in Google Rich Results Test and Schema.org Validator.

## Deferred by team request

- Google Analytics button/event tracking.
- JMeter load testing.

These are intentionally not implemented in this patch.
