import type { MetadataRoute } from "next";
import { getCmsContent } from "@/shared/content";
import { SITE_URL, slugifySeo } from "@/shared/seo";
import { contentDate, getContentLastModified } from "@/shared/seo-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: en }, { data: ar }, enUpdatedAt, arUpdatedAt] = await Promise.all([
    getCmsContent("en"),
    getCmsContent("ar"),
    getContentLastModified("en"),
    getContentLastModified("ar"),
  ]);

  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1, lastModified: enUpdatedAt },
    { url: `${SITE_URL}/ar`, changeFrequency: "weekly", priority: 0.95, lastModified: arUpdatedAt },
    { url: `${SITE_URL}/solutions`, changeFrequency: "monthly", priority: 0.95, lastModified: enUpdatedAt },
    { url: `${SITE_URL}/ar/solutions`, changeFrequency: "monthly", priority: 0.9, lastModified: arUpdatedAt },
    { url: `${SITE_URL}/industries`, changeFrequency: "monthly", priority: 0.9, lastModified: enUpdatedAt },
    { url: `${SITE_URL}/ar/industries`, changeFrequency: "monthly", priority: 0.85, lastModified: arUpdatedAt },
    { url: `${SITE_URL}/method`, changeFrequency: "monthly", priority: 0.85, lastModified: enUpdatedAt },
    { url: `${SITE_URL}/ar/method`, changeFrequency: "monthly", priority: 0.82, lastModified: arUpdatedAt },
    { url: `${SITE_URL}/products`, changeFrequency: "weekly", priority: 0.8, lastModified: enUpdatedAt },
    { url: `${SITE_URL}/ar/products`, changeFrequency: "weekly", priority: 0.78, lastModified: arUpdatedAt },
    { url: `${SITE_URL}/blogs`, changeFrequency: "weekly", priority: 0.85, lastModified: enUpdatedAt },
    { url: `${SITE_URL}/ar/blogs`, changeFrequency: "weekly", priority: 0.82, lastModified: arUpdatedAt },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.8, lastModified: enUpdatedAt },
    { url: `${SITE_URL}/careers`, changeFrequency: "weekly", priority: 0.75, lastModified: enUpdatedAt },
    { url: `${SITE_URL}/ar/careers`, changeFrequency: "weekly", priority: 0.72, lastModified: arUpdatedAt },
  ];

  const addBlogUrls = (
    locale: "en" | "ar",
    data: typeof en,
    updatedAt: Date,
  ) => {
    const blogItems = [
      ...(data.blogs.updates ?? []).map((item) => ({ title: item.title, date: item.date })),
      ...(data.blogs.posts ?? []).map((item) => ({ title: item.title, date: item.date })),
    ];
    const seen = new Set<string>();
    for (const item of blogItems) {
      const slug = slugifySeo(item.title);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const prefix = locale === "ar" ? "/ar" : "";
      base.push({
        url: `${SITE_URL}${prefix}/blogs/${slug}`,
        changeFrequency: "monthly",
        priority: locale === "ar" ? 0.69 : 0.72,
        lastModified: contentDate(item.date, updatedAt),
      });
    }
  };

  addBlogUrls("en", en, enUpdatedAt);
  addBlogUrls("ar", ar as typeof en, arUpdatedAt);

  return base;
}
