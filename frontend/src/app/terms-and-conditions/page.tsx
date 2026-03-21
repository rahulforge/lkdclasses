import type { Metadata } from "next";
import Footer from "@/components/Footer";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const siteLogo = process.env.NEXT_PUBLIC_SITE_LOGO || "/logo.png";

export const metadata: Metadata = {
  title: `Terms and Conditions | ${siteName}`,
  description: "Terms and conditions for admissions, payments, and usage of LKD Classes services.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
  openGraph: {
    title: `Terms and Conditions | ${siteName}`,
    description: "Terms and conditions for admissions, payments, and usage of LKD Classes services.",
    url: `${siteUrl}/terms-and-conditions`,
    siteName,
    images: [siteLogo],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Terms and Conditions | ${siteName}`,
    description: "Terms and conditions for admissions, payments, and usage of LKD Classes services.",
    images: [siteLogo],
  },
};

export default function TermsPage() {
  return (
    <>
      <section className="relative py-28 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-center overflow-hidden">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Terms and Conditions</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed mb-8">
          Last updated: March 9, 2026
        </p>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white rounded-t-[50%]" />
      </section>

      <section className="pb-16 bg-white px-6 md:px-12 -mt-12 relative z-10">
        <div className="max-w-4xl mx-auto bg-indigo-50 rounded-2xl p-8 shadow-lg text-gray-700 space-y-4">
          <p>LKD Classes is a coaching institute for academic learning and guidance.</p>
          <p>The website is used for institute information and secure online fee payment.</p>
          <p>
            Students and parents must provide correct information during registration and payment.
            Admission and attendance are governed by institute rules.
          </p>
          <p>
            Course content and study materials are for enrolled students and may not be redistributed without permission.
          </p>
          <p>
            For support, contact <strong>lkdclasses@gmail.com</strong> or <strong>+91 8002271522</strong>.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}

