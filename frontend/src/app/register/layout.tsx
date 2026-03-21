import type { Metadata } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const siteLogo = process.env.NEXT_PUBLIC_SITE_LOGO || "/logo.png";

export const metadata: Metadata = {
  title: `Register | ${siteName}`,
  description: "Register for LKD Classes courses and complete your admission process online.",
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: `Register | ${siteName}`,
    description: "Register for LKD Classes courses and complete your admission process online.",
    url: `${siteUrl}/register`,
    siteName,
    images: [siteLogo],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Register | ${siteName}`,
    description: "Register for LKD Classes courses and complete your admission process online.",
    images: [siteLogo],
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
