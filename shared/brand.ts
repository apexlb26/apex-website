/*
 * The APEX lockup (monogram + wordmark). Header, hero and footer all render
 * this one file, so the logo cannot drift between them. It is deliberately not
 * read from the CMS `meta.logo` field, which can hold a stale or different path.
 */
export const BRAND_LOGO = "/api/assets/logo/apex-logo.svg";
export const BRAND_LOGO_ALT = "APEX";
