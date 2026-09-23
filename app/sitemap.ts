import type { MetadataRoute } from "next";

const SITE_URL = "https://unsent.cc";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number; frequency: "daily" | "weekly" | "monthly" }[] = [
    { path: "", priority: 1, frequency: "daily" },
    { path: "/explore", priority: 0.9, frequency: "daily" },
    { path: "/submit", priority: 0.7, frequency: "weekly" },
    { path: "/terms", priority: 0.3, frequency: "monthly" },
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.frequency,
    priority: route.priority,
  }));
}