import type { MetadataRoute } from "next";

const SITE_URL = "https://unsent.cc";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}