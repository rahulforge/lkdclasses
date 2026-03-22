"use client";

import { useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import StatsCard from "@/components/StatsCard";
import { COURSE_PRICING } from "@/config/coursePricing";
import Image from "next/image";
import Script from "next/script";

export default function HomeClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const founderRef = useRef<HTMLDivElement>(null);
  const rankersRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const coursesRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const enrollRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const stats = [
    { number: "800+", label: "Students" },
    { number: "1500+", label: "Alumni" },
    { number: "5700+", label: "Passouts" },
    { number: "500+", label: "Top Rankers" },
  ];

  const courses = COURSE_PRICING.map((item) => ({
    className: item.label,
    plans: [{ label: "Monthly", planId: "monthly", duration: "1 Month", fee: item.pricing.monthly }],
  }));
  const appDownloadUrl = process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL || "/downloads/LKD_Classes.apk";
  const payLink = `/login?next=${encodeURIComponent("/student-portal?section=payments")}`;
  const googleReviewsLink = (process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_LINK || "").trim();

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    let isMounted = true;

    const run = async () => {
      if (!heroRef.current) return;
      if (typeof window === "undefined") return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const shouldAnimate = !prefersReducedMotion && window.innerWidth >= 768;
      if (!shouldAnimate) return;

      const gsapModule = await import("gsap");
      const scrollModule = await import("gsap/dist/ScrollTrigger");
      if (!isMounted) return;

      const gsap = gsapModule.default;
      const ScrollTrigger = scrollModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const hero = heroRef.current;
        if (hero) {
          gsap.fromTo(
            hero.querySelector("h1"),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1.2 }
          );
          gsap.fromTo(
            hero.querySelector("p"),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1.2, delay: 0.25 }
          );
          const heroCtas = hero.querySelectorAll('[data-hero-cta="true"]');
          if (heroCtas.length > 0) {
            gsap.fromTo(
              heroCtas,
              { opacity: 0, y: -10 },
              { opacity: 1, y: 0, duration: 0.9, delay: 0.4, stagger: 0.12 }
            );
          }
        }

        const sections = [
          { ref: aboutRef, y: 50 },
          { ref: founderRef, y: 50 },
          { ref: rankersRef, y: 30 },
          { ref: statsRef, y: 20 },
          { ref: coursesRef, y: 30 },
          { ref: galleryRef, y: 30 },
          { ref: testimonialRef, y: 20 },
          { ref: reviewsRef, y: 20 },
          { ref: enrollRef, y: 30 },
        ];

        sections.forEach(({ ref, y }) => {
          if (ref.current) {
            gsap.from(ref.current, {
              scrollTrigger: { trigger: ref.current, start: "top 80%", toggleActions: "play none none none" },
              opacity: 0,
              y,
              duration: 1,
              ease: "power2.out",
            });
          }
        });
      }, heroRef);
    };

    run();

    return () => {
      isMounted = false;
      ctx?.revert();
    };
  }, []);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lkdclasses.com";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "LKD Classes",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Sitalpur",
      addressRegion: "Bihar",
      addressCountry: "IN",
    },
    areaServed: "Sitalpur, Saran, Bihar",
    description:
      "Coaching institute in Sitalpur for classes 6th to 12th and competitive exam preparation.",
  };

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      <main>
      <section
        ref={heroRef}
        className="relative w-full h-screen flex flex-col justify-center items-center bg-gradient-to-r from-indigo-500 to-blue-400 text-white text-center overflow-hidden px-4 md:px-6"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight relative">
          LKD Classes Sitalpur, Saran <br />
          <span className="text-yellow-300 relative inline-block">
            Best Coaching Institute
            <span className="absolute left-0 -bottom-2 w-full h-1 bg-yellow-400 rounded-full opacity-50 animate-pulse"></span>
          </span>
        </h1>
        <p className="text-lg md:text-2xl max-w-3xl mb-6">
          Coaching in Sitalpur for Science, Math, English and more. Structured classes for 6th-12th grades and competitive exams.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="/register"
            data-hero-cta="true"
            data-cta="enroll_hero"
            className="bg-yellow-400 text-indigo-900 px-8 md:px-10 py-3 md:py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition transform"
          >
            Enroll Now
          </a>
          <a
            href="/result"
            data-hero-cta="true"
            data-cta="download_app_hero"
            className="bg-white text-indigo-700 px-8 md:px-10 py-3 md:py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition transform"
          >
            9th TSE Result
          </a>
          <a
            href="https://interbiharboard.com"
            data-hero-cta="true"
            data-cta="download_app_hero"
            className="bg-yellow-300 text-indigo-700 px-8 md:px-10 py-3 md:py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition transform"
          >
            View Inter 2026 Result
          </a>
        </div>
      </section>


      <section ref={aboutRef} className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-r from-indigo-50 to-blue-50 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">About LKD Classes</h2>
        <p className="max-w-3xl mx-auto text-gray-700 text-base md:text-lg">
          Located in Sitalpur, Parsa Road, Saran, Bihar, LKD Classes provides coaching for students from 6th to 12th and Competitive Exams with focus on excellence, confidence, and stress-free learning.
        </p>
      </section>

      <section ref={founderRef} className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-r from-indigo-50 to-blue-50 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Message from the Founder</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 max-w-6xl mx-auto">
          <Image
            src="/images/founder.png"
            alt="Founder Laliteshwar Kumar"
            width={256}
            height={256}
            className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-full shadow-2xl"
            sizes="(min-width: 768px) 256px, 192px"
          />
          <div className="max-w-xl text-left">
            <p className="text-gray-700 text-base md:text-lg italic">
              "Education is not just about marks - it is about building confidence, discipline, and the right mindset for success. At LKD Classes, our mission is to inspire young minds and prepare them for the challenges of tomorrow."
            </p>
            <p className="mt-4 md:mt-6 font-semibold text-indigo-900">- Laliteshwar Kumar, Founder</p>
          </div>
        </div>
      </section>

      <section ref={statsRef} className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-r from-indigo-50 to-blue-50 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Our Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-6xl mx-auto">
          {stats.map((stat, i) => (
            <StatsCard key={i} number={stat.number} label={stat.label} />
          ))}
        </div>
      </section>

      <section ref={coursesRef} className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-r from-indigo-50 to-blue-50 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Our Courses</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-6xl mx-auto">
          {courses.map((course, i) => (
            <div key={i} className="p-4 md:p-6 border rounded-xl shadow hover:shadow-lg transition">
              <h3 className="text-lg md:text-xl font-bold text-indigo-600 mb-1 md:mb-2">{course.className}</h3>
              <div className="space-y-2">
                {course.plans.map((plan) => (
                  <div key={plan.planId} className="bg-white border rounded-lg p-2 text-left">
                    <p className="text-sm font-semibold text-indigo-700">{plan.label}</p>
                    <p className="text-xs text-gray-700">Duration: {plan.duration} | Fee: Rs {plan.fee}</p>
                    <div className="mt-2 flex gap-2">
                      <a
                        href={`/register?class=${encodeURIComponent(course.className)}&plan=${plan.planId}`}
                        data-cta="enroll_course_card"
                        data-class={course.className}
                        data-plan={plan.planId}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-semibold"
                      >
                        Enroll
                      </a>
                      <a
                        href={payLink}
                        data-cta="pay_fees_course_card"
                        data-class={course.className}
                        className="bg-yellow-400 text-indigo-900 px-3 py-1 rounded-lg text-xs font-semibold"
                      >
                        Pay Fees
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section ref={testimonialRef} className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-r from-indigo-50 to-blue-50 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Testimonials</h2>
        <div className="grid md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
          <div className="p-4 md:p-6 border rounded-xl shadow">
            <p className="text-gray-700 italic text-sm md:text-base">"Great coaching, improved confidence and results!"</p>
            <p className="mt-2 md:mt-4 font-semibold text-indigo-900 text-sm md:text-base">- Shashikant</p>
          </div>
          <div className="p-4 md:p-6 border rounded-xl shadow">
            <p className="text-gray-700 italic text-sm md:text-base">"Amazing guidance and support from teachers."</p>
            <p className="mt-2 md:mt-4 font-semibold text-indigo-900 text-sm md:text-base">- Priya</p>
          </div>
          <div className="p-4 md:p-6 border rounded-xl shadow">
            <p className="text-gray-700 italic text-sm md:text-base">"Structured classes and great environment."</p>
            <p className="mt-2 md:mt-4 font-semibold text-indigo-900 text-sm md:text-base">- Ashish</p>
          </div>
        </div>
      </section>

      <section ref={reviewsRef} className="py-16 md:py-24 px-4 md:px-6 bg-white text-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-indigo-900">Google Reviews</h2>
          <p className="text-gray-700 max-w-3xl mx-auto mb-10">
            Parents and students share their experiences with LKD Classes.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Amit Kumar",
                text: "Teachers are very supportive. My son's confidence improved a lot in just a few months.",
              },
              {
                name: "Neha Singh",
                text: "Best coaching in Sitalpur. Regular tests and feedback helped me score higher.",
              },
              {
                name: "Ravi Prakash",
                text: "Disciplined environment and clear concepts. Highly recommended for board preparation.",
              },
            ].map((review, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6 text-left shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-indigo-900">{review.name}</p>
                  <div className="text-yellow-500 text-sm">★★★★★</div>
                </div>
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">"{review.text}"</p>
              </div>
            ))}
          </div>

          {googleReviewsLink ? (
            <div className="mt-8">
              <a
                href={googleReviewsLink}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition"
                target="_blank"
                rel="noreferrer"
              >
                Read more reviews on Google
              </a>
            </div>
          ) : null}
        </div>
      </section>

      <section ref={enrollRef} className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-r from-indigo-500 to-blue-400 text-white text-center mb-0">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Join LKD Classes Today</h2>
        <p className="max-w-3xl mx-auto mb-6 text-sm md:text-base">Register now and start your journey towards excellence.</p>
        <a
          href="/register"
          data-cta="enroll_footer"
          className="bg-yellow-400 text-indigo-900 px-8 md:px-10 py-3 md:py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition transform"
        >
          Enroll Now
        </a>
      </section>

      <Footer />
      </main>
    </>
  );
}
