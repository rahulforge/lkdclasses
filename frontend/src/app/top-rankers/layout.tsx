import type { Metadata } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const siteLogo = process.env.NEXT_PUBLIC_SITE_LOGO || "/logo.png";

export const metadata: Metadata = {
  title: `Top Rankers | ${siteName}`,
  description: "Meet the top achievers and rankers from LKD Classes.",
  alternates: {
    canonical: "/top-rankers",
  },
  openGraph: {
    title: `Top Rankers | ${siteName}`,
    description: "Meet the top achievers and rankers from LKD Classes.",
    url: `${siteUrl}/top-rankers`,
    siteName,
    images: [siteLogo],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Top Rankers | ${siteName}`,
    description: "Meet the top achievers and rankers from LKD Classes.",
    images: [siteLogo],
  },
};

export default function TopRankersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
