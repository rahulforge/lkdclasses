import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.netlify.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/",
    "/about",
    "/contact",
    "/courses",
    "/founder",
    "/result",
    "/register",
    "/privacy-policy",
    "/terms-and-conditions",
    "/refund-cancellation-policy",
  ];

  return pages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
