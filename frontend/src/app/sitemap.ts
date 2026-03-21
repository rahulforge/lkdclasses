import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";

const now = new Date();

const pages: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.85 },
  { path: "/courses", changeFrequency: "monthly", priority: 0.85 },
  { path: "/founder", changeFrequency: "monthly", priority: 0.8 },
  { path: "/gallery", changeFrequency: "monthly", priority: 0.75 },
  { path: "/top-rankers", changeFrequency: "monthly", priority: 0.75 },
  { path: "/result", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/register", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.4 },
  { path: "/refund-cancellation-policy", changeFrequency: "yearly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
