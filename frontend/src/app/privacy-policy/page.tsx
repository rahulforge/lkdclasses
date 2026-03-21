import type { Metadata } from "next";
import Footer from "@/components/Footer";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const siteLogo = process.env.NEXT_PUBLIC_SITE_LOGO || "/logo.png";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteName}`,
  description: "Read the privacy policy of LKD Classes for data collection and payment handling.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: `Privacy Policy | ${siteName}`,
    description: "Read the privacy policy of LKD Classes for data collection and payment handling.",
    url: `${siteUrl}/privacy-policy`,
    siteName,
    images: [siteLogo],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Privacy Policy | ${siteName}`,
    description: "Read the privacy policy of LKD Classes for data collection and payment handling.",
    images: [siteLogo],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="relative py-28 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-center overflow-hidden">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Privacy Policy</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed mb-8">
          Last updated: March 9, 2026
        </p>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white rounded-t-[50%]" />
      </section>

      <section className="pb-16 bg-white px-6 md:px-12 -mt-12 relative z-10">
        <div className="max-w-4xl mx-auto bg-indigo-50 rounded-2xl p-8 shadow-lg text-gray-700 space-y-4">
          <p>
            LKD Classes collects student and parent contact information only for admission support, academic communication, and fee processing.
          </p>
          <p>
            Online payments are processed through Razorpay. We do not store card details, UPI PIN, or bank credentials on our website.
          </p>
          <p>
            We do not sell personal data. Information is shared only when required for payment processing, operations, or legal compliance.
          </p>
          <p>
            For privacy concerns, contact us at <strong>lkdclasses@gmail.com</strong> or <strong>+91 8002271522</strong>.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}

