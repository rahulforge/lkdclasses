import type { Metadata } from "next";
import CoursesClient from "./CoursesClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";
const siteLogo = process.env.NEXT_PUBLIC_SITE_LOGO || "/logo.png";

export const metadata: Metadata = {
  title: `Courses | ${siteName}`,
  description:
    "Explore LKD Classes courses for classes 6th to 12th with structured monthly plans, expert mentoring, and focused test preparation.",
  alternates: {
    canonical: "/courses",
  },
  openGraph: {
    title: `Courses | ${siteName}`,
    description:
      "Explore LKD Classes courses for classes 6th to 12th with structured monthly plans, expert mentoring, and focused test preparation.",
    url: `${siteUrl}/courses`,
    siteName,
    images: [siteLogo],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Courses | ${siteName}`,
    description:
      "Explore LKD Classes courses for classes 6th to 12th with structured monthly plans, expert mentoring, and focused test preparation.",
    images: [siteLogo],
  },
};

export default function CoursesPage() {
  return <CoursesClient />;
}
