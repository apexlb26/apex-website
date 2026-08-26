import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://apexlb.tech";
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/solutions`, changeFrequency: "monthly", priority: .9 },
    { url: `${base}/industries`, changeFrequency: "monthly", priority: .9 },
    { url: `${base}/method`, changeFrequency: "monthly", priority: .8 },
    { url: `${base}/products`, changeFrequency: "weekly", priority: .8 },
    { url: `${base}/blogs`, changeFrequency: "weekly", priority: .8 },
    { url: `${base}/careers`, changeFrequency: "weekly", priority: .7 },
  ];
}
