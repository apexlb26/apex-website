import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/seo";

const privatePaths = ["/admin/", "/api/admin/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      {
        // Explicitly keep public marketing content available to ChatGPT Search.
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: privatePaths,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
