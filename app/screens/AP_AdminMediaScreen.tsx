import AP_MediaManager from "@/app/components/AP_MediaManager";
import { getContent } from "@/shared/store";

/** Every image path used anywhere in the content tree, at any depth. */
function collectPaths(value: unknown, found: Set<string>) {
  if (typeof value === "string") {
    if (value.startsWith("/api/media/") || value.startsWith("/api/assets/")) found.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectPaths(entry, found);
    return;
  }
  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) collectPaths(entry, found);
  }
}

export default async function AP_AdminMediaScreen() {
  const [en, ar] = await Promise.all([getContent("en"), getContent("ar")]);

  /*
   * Walking the content is what makes the "in use" marker trustworthy: the old
   * hard-coded list of five paths went stale the moment anyone changed an image
   * anywhere else on the site.
   */
  const referenced = new Set<string>();
  collectPaths(en, referenced);
  collectPaths(ar, referenced);

  return <AP_MediaManager referencedPaths={[...referenced].sort()} />;
}
