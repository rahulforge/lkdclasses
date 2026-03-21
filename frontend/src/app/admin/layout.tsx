import type { Metadata } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";

export const metadata: Metadata = {
  title: `Admin | ${siteName}`,
  description: "LKD Classes admin dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
