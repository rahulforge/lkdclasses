import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";
const siteLogo = process.env.NEXT_PUBLIC_SITE_LOGO || "/logo.png";

export const metadata: Metadata = {
  title: `${siteName} | Best Coaching Institute in Sitalpur`,
  description:
    "LKD Classes is a coaching institute in Sitalpur, Saran, Bihar for classes 6th to 12th and competitive exam preparation. Strong results, focused mentoring, and disciplined learning.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteName} | Best Coaching Institute in Sitalpur`,
    description:
      "Trusted coaching institute in Sitalpur, Saran, Bihar for classes 6th to 12th and competitive exams.",
    url: siteUrl,
    siteName,
    type: "website",
    images: [{ url: siteLogo, width: 512, height: 512, alt: `${siteName} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Best Coaching Institute in Sitalpur`,
    description:
      "Trusted coaching institute in Sitalpur, Saran, Bihar for classes 6th to 12th and competitive exams.",
    images: [siteLogo],
  },
};

export default function HomePage() {
  return <HomeClient />;
}
