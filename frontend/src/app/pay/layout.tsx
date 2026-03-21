import type { Metadata } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";

export const metadata: Metadata = {
  title: `Payments | ${siteName}`,
  description: "Secure online payments for LKD Classes.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
