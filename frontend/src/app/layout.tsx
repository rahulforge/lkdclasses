import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
import PageTransition from "../components/PageTransition";
import ChatWidget from "../components/ChatWidget";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Best Coaching Institute in Sitalpur`,
    template: `%s | ${siteName}`,
  },
  description:
    "LKD Classes is a coaching institute in Sitalpur, Saran, Bihar for classes 6th to 12th and competitive exam preparation. Strong results, focused mentoring, and disciplined learning.",
  applicationName: siteName,
  category: "education",
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
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
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KZCZ87PN"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="gtm"
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

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
        <ChatWidget />

        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KZCZ87PN');`}
        </Script>
        {/* End Google Tag Manager */}

        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-H4ZSP250DX"
          strategy="afterInteractive"
        />
        <Script id="ga4-script" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-H4ZSP250DX');`}
        </Script>
        {/* End Google Analytics */}
      </body>
    </html>
  );
}
