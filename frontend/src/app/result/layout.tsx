import type { Metadata } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const siteLogo = process.env.NEXT_PUBLIC_SITE_LOGO || "/logo.png";

export const metadata: Metadata = {
  title: `Results | ${siteName}`,
  description: "Check LKD Classes results.",
  alternates: {
    canonical: "/result",
  },
  openGraph: {
    title: `Results | ${siteName}`,
    description: "Check LKD Classes results using mobile number and password.",
    url: `${siteUrl}/result`,
    siteName,
    images: [siteLogo],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Results | ${siteName}`,
    description: "Check LKD Classes results using mobile number and password.",
    images: [siteLogo],
  },
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
