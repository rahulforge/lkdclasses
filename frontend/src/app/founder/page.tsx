"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function FounderPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animateSection = (element: HTMLDivElement | null) => {
      if (!element) return;
      gsap.fromTo(
        element.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
          },
        }
      );
    };

    [heroRef, infoRef, statsRef, timelineRef, galleryRef, quoteRef].forEach(
      (ref) => animateSection(ref.current)
    );
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative w-full py-28 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-center overflow-hidden"
      >
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            Meet Our Founder
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-4">
            Mr. Laliteshwar Kumar
          </h2>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed">
            The visionary behind <b>LKD Classes</b> — inspiring students to
            think, learn, and grow with passion and discipline.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white rounded-t-[50%]" />
      </section>

      {/* Founder Info */}
      <section
        ref={infoRef}
        className="pb-20 bg-white text-gray-800 px-6 md:px-12 text-center md:text-left -mt-16"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-4 items-center">
          <div>
            <Image
              src="/images/founder.png"
              alt="Founder"
              width={400}
              height={400}
              className="rounded-full shadow-2xl object-cover mx-auto hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-4">
              The Journey of Dedication
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              With over a decade of experience in teaching and mentoring, Mr.
              Laliteshwar Kumar founded LKD Classes with a mission to bridge the
              gap between potential and performance.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              His passion for education, innovative methods, and personal
              attention to every student have made LKD Classes a trusted name in
              Saran and beyond.
            </p>
            <p className="font-semibold text-indigo-700 italic">
              “Education is not the filling of a pail, but the lighting of a
              fire.”
            </p>
          </div>
        </div>
      </section>

      {/* Achievements & Stats */}
      <section
        ref={statsRef}
        className="py-20 bg-gradient-to-r from-indigo-50 to-blue-50 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">
          Achievements & Milestones
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">

          {[
            { value: "10+", label: "Years of Excellence", icon: "🏆" },
            { value: "5000+", label: "Students Mentored", icon: "🎓" },
            { value: "100+", label: "Top Rankers", icon: "📘" },
            { value: "5+", label: "Dedicated Faculty", icon: "👨‍🏫" },
          ].map((item, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-2xl shadow hover:shadow-xl transition transform hover:scale-105 flex flex-col items-center"
            >
              <div className="text-5xl mb-2">{item.icon}</div>
              <h3 className="text-4xl font-bold text-indigo-600 mb-2">
                {item.value}
              </h3>
              <p className="text-gray-700 font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section
        ref={timelineRef}
        className="py-20 bg-white px-6 md:px-12 text-gray-800"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Milestones & Journey
        </h2>
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-indigo-300 h-full"></div>
          {[
            { year: "2010", desc: "Started teaching locally in Saran." },
            { year: "2014", desc: "Founded LKD Classes with first batch of students." },
            { year: "2018", desc: "Expanded to advanced coaching for 6th–12th." },
            { year: "2023", desc: "Celebrated 5000+ students mentored milestone." },
          ].map((event, i) => (
            <div
              key={i}
              className={`mb-8 flex justify-between items-center w-full ${
                i % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
            >
              <div className="w-5/12"></div>
              <div className="w-2/12 flex justify-center">
                <div className="bg-indigo-600 w-8 h-8 rounded-full z-10"></div>
              </div>
              <div className="w-5/12 bg-indigo-50 p-6 rounded-xl shadow-lg">
                <p className="font-semibold text-indigo-600">{event.year}</p>
                <p>{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

 {/* Quote Section */}
      <section
        ref={quoteRef}
        className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center px-6"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            “True education builds character, confidence, and clarity.”
          </h2>
          <p className="text-lg opacity-90 mb-4">
            Mr. Laliteshwar believes in a holistic approach — nurturing minds
            while developing values that shape responsible citizens and achievers.
          </p>
        </div>
      </section>
      {/* Founder Gallery */}
      <section
        ref={galleryRef}
        className="py-20 bg-white px-6 md:px-12 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-10">
          Glimpses of Leadership & Mentorship
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {["founder1.jpg", "founder2.jpg", "founder3.jpg"].map((img, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <Image
                src={`/images/${img}`}
                alt="Founder Moment"
                width={400}
                height={300}
                className="object-cover w-full h-64"
              />
            </div>
          ))}
        </div>
      </section>

     

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-500 to-blue-400 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Join the Legacy of LKD Classes
        </h2>
        <p className="text-lg opacity-90 mb-8">
          Be part of an institution driven by excellence and led by vision.
        </p>
        <a
          href="/register"
          className="bg-yellow-400 text-indigo-900 px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition"
        >
          Enroll Now
        </a>
      </section>

      <Footer />
    </>
  );
}
