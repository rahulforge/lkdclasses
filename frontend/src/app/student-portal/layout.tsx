import type { Metadata } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";

export const metadata: Metadata = {
  title: `Student Portal | ${siteName}`,
  description: "LKD Classes student portal for profile, payments, and results.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-gray-50 min-h-screen font-sans">{children}</div>;
}
