import type { Metadata } from "next";
import AboutPage from "./About";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const siteDescription =
  "Learn more about LKD Classes in Sitalpur, Saran - our mission, vision, and dedication to empowering students through expert faculty, structured learning, and a results-oriented approach.";
const siteLogo = process.env.NEXT_PUBLIC_SITE_LOGO || "/logo.png";

export const metadata: Metadata = {
  title: `About | ${siteName}`,
  description: siteDescription,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: `About | ${siteName}`,
    description: siteDescription,
    url: `${siteUrl}/about`,
    siteName,
    images: [siteLogo],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `About | ${siteName}`,
    description: siteDescription,
    images: [siteLogo],
  },
};

export default function Page() {
  return <AboutPage />;
}
