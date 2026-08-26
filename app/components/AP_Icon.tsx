import type { AP_IconName } from "@/shared/types";

/*
 * The sprite is one URL whose contents change whenever an icon is added, and it
 * is served with a long cache. Bump this when you add or edit a symbol so
 * browsers holding an older sprite do not render an empty <use>.
 */
const SPRITE_VERSION = "5";

export default function AP_Icon({ name, className = "" }: { name: AP_IconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <use href={`/api/assets/icons/icons.svg?v=${SPRITE_VERSION}#${name}`} />
    </svg>
  );
}
