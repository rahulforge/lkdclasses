import type { Metadata } from "next";
import FounderClient from "./FounderClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";
const siteLogo = process.env.NEXT_PUBLIC_SITE_LOGO || "/logo.png";

export const metadata: Metadata = {
  title: `Founder | ${siteName}`,
  description:
    "Meet the founder of LKD Classes and learn about the journey, values, and milestones behind the institute's success in Sitalpur, Saran, Bihar.",
  alternates: {
    canonical: "/founder",
  },
  openGraph: {
    title: `Founder | ${siteName}`,
    description:
      "Meet the founder of LKD Classes and learn about the journey, values, and milestones behind the institute's success in Sitalpur, Saran, Bihar.",
    url: `${siteUrl}/founder`,
    siteName,
    images: [siteLogo],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Founder | ${siteName}`,
    description:
      "Meet the founder of LKD Classes and learn about the journey, values, and milestones behind the institute's success in Sitalpur, Saran, Bihar.",
    images: [siteLogo],
  },
};

export default function FounderPage() {
  return <FounderClient />;
}
