import type { Metadata } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";

export const metadata: Metadata = {
  title: `Login | ${siteName}`,
  description: "Login to the LKD Classes student or admin portal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
