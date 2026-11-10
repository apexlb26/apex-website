/**
 * CMS images are served from /api/media/<id>, which can resize on request.
 * Ask for roughly the width the image is displayed at instead of the original,
 * which may be several megabytes. Other URLs (static assets, external) pass
 * through unchanged.
 */
export function sizedImage(src: string, width: number): string {
  return src.startsWith("/api/media/") && !src.includes("?") ? `${src}?w=${width}` : src;
}

/** srcset for a CMS image so the browser picks the smallest adequate file. */
export function imageSrcSet(src: string, widths: number[] = [480, 800, 1200]): string | undefined {
  if (!src.startsWith("/api/media/") || src.includes("?")) return undefined;
  return widths.map((w) => `${src}?w=${w} ${w}w`).join(", ");
}
