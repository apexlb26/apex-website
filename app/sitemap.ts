import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/solutions`, changeFrequency: "monthly", priority: 0.95 },
    { url: `${SITE_URL}/industries`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/method`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE_URL}/products`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blogs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/careers`, changeFrequency: "weekly", priority: 0.75 },
  ];
}
