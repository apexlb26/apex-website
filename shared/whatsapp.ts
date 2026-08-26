import type { SocialContent } from "@/shared/types";

/**
 * Build the wa.me link the site opens.
 *
 * The number is authored in the CMS in whatever human format suits
 * ("+961 79 453 181"); wa.me wants digits only, so everything else is
 * stripped here. A full URL in `social.whatsapp` still wins, so existing
 * content keeps working.
 */
export function whatsappHref(social: Pick<SocialContent, "whatsapp" | "whatsappNumber" | "whatsappMessage">): string {
  if (social.whatsapp?.trim()) return social.whatsapp.trim();

  const digits = (social.whatsappNumber ?? "").replace(/\D/g, "");
  if (!digits) return "";

  const message = social.whatsappMessage?.trim();
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
