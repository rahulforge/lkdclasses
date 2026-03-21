import type { Metadata } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const siteLogo = process.env.NEXT_PUBLIC_SITE_LOGO || "/logo.png";

export const metadata: Metadata = {
  title: `Gallery | ${siteName}`,
  description: "Explore photos and event highlights from LKD Classes in Sitalpur.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: `Gallery | ${siteName}`,
    description: "Explore photos and event highlights from LKD Classes in Sitalpur.",
    url: `${siteUrl}/gallery`,
    siteName,
    images: [siteLogo],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Gallery | ${siteName}`,
    description: "Explore photos and event highlights from LKD Classes in Sitalpur.",
    images: [siteLogo],
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
