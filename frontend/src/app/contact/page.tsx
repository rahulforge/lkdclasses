import type { Metadata } from "next";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LKD Classes";
const siteLogo = process.env.NEXT_PUBLIC_SITE_LOGO || "/logo.png";

export const metadata: Metadata = {
  title: `Contact | ${siteName}`,
  description:
    "Contact LKD Classes for admissions, fee payments, and course information in Sitalpur, Saran, Bihar.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: `Contact | ${siteName}`,
    description:
      "Contact LKD Classes for admissions, fee payments, and course information in Sitalpur, Saran, Bihar.",
    url: `${siteUrl}/contact`,
    siteName,
    images: [siteLogo],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact | ${siteName}`,
    description:
      "Contact LKD Classes for admissions, fee payments, and course information in Sitalpur, Saran, Bihar.",
    images: [siteLogo],
  },
};

export default function ContactPage() {
  return (
    <>
      <section className="relative py-28 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-center overflow-hidden">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Contact Us</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed mb-8">
          For admissions, fee payment support, and course information.
        </p>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white rounded-t-[50%]" />
      </section>

      <section className="pb-16 bg-white px-6 md:px-12 -mt-12 relative z-10">
        <div className="max-w-4xl mx-auto bg-indigo-50 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">LKD Classes</h2>
          <p className="text-gray-700 mb-2"><strong>Phone:</strong> +91 8002271522</p>
          <p className="text-gray-700 mb-2"><strong>Email:</strong> lkdclasses2007@gmail.com</p>
          <p className="text-gray-700 mb-2"><strong>Address:</strong> Parsa Road, Sitalpur, Saran, Bihar, India</p>
          <p className="text-gray-700 mt-4">
            LKD Classes provides coaching for students and supports online fee payment.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}

