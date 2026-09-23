import type { MetadataRoute } from "next";

const SITE_URL = "https://unsent.cc";

const routes: {
  path: string;
  priority: number;
  frequency: "daily" | "weekly" | "monthly";
  lastModified: string;
}[] = [
  { path: "", priority: 1, frequency: "daily", lastModified: "2026-09-24" },
  {
    path: "/explore",
    priority: 0.9,
    frequency: "daily",
    lastModified: "2026-09-24",
  },
  {
    path: "/submit",
    priority: 0.7,
    frequency: "weekly",
    lastModified: "2026-09-24",
  },
  {
    path: "/terms",
    priority: 0.3,
    frequency: "monthly",
    lastModified: "2026-09-24",
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.frequency,
    priority: route.priority,
  }));
}