import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
import PageTransition from "../components/PageTransition";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.netlify.app";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Best Coaching Institute in Sitalpur`,
    template: `%s | ${siteName}`,
  },
  description:
    "LKD Classes is a coaching institute in Sitalpur, Saran, Bihar for classes 6th to 12th and competitive exam preparation. Strong results, focused mentoring, and disciplined learning.",
  keywords: [
    "LKD Classes",
    "LKD Classes Sitalpur",
    "best coaching institute in Sitalpur",
    "coaching in Sitalpur",
    "Saran coaching institute",
    "Dighwara coaching",
    "Patna coaching institute",
    "Dighwara best coaching",
    "Bihar coaching",
    "class 6 to 12 coaching",
    "competitive exam coaching",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteName} | Best Coaching Institute in Sitalpur`,
    description:
      "Trusted coaching institute in Sitalpur, Saran, Bihar for classes 6th to 12th and competitive exams.",
    url: siteUrl,
    siteName,
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: `${siteName} logo` }],
  },
  twitter: {
    card: "summary",
    title: `${siteName} | Best Coaching Institute in Sitalpur`,
    description:
      "Trusted coaching institute in Sitalpur, Saran, Bihar for classes 6th to 12th and competitive exams.",
    images: ["/logo.png"],
  },
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Navbar />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: { fontSize: "14px", borderRadius: "8px", padding: "12px 16px" },
          }}
        />

        {/* Page transitions now in client component */}
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}


