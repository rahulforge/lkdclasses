"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import { FaFacebookF, FaYoutube } from "react-icons/fa";
gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  // Type-safe array of section refs
  const sectionRefs = useRef<HTMLDivElement[]>([]);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  useEffect(() => {
    sectionRefs.current.forEach((section) => {
      if (section) {
        const targets = section.querySelectorAll<HTMLElement>(".fade-up");
        if (targets.length) {
          gsap.fromTo(
            targets,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 1.2,
              stagger: 0.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      }
    });
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section
        ref={addToRefs}
        className="relative w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-28 px-6 text-center overflow-hidden"
      >
        <div className="max-w-4xl mx-auto fade-up">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            <span className="block">About</span>
            <span className="block text-yellow-300">LKD Classes</span>
          </h1>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed fade-up">
            Empowering students through dedicated teaching, mentorship, and structured learning for a brighter tomorrow.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white rounded-t-[50%]" />
      </section>

      {/* Mission & Vision */}
      <section ref={addToRefs} className="bg-white px-6 text-center pb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-800 fade-up">Our Mission & Vision</h2>
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <div className="p-8 rounded-2xl shadow-md border hover:shadow-lg transition fade-up">
            <h3 className="text-2xl font-semibold text-indigo-600 mb-3">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              Provide top-quality academic coaching for classes 6th–12th, helping students master concepts,
              improve performance, and build confidence through personalized guidance.
            </p>
          </div>
          <div className="p-8 rounded-2xl shadow-md border hover:shadow-lg transition fade-up">
            <h3 className="text-2xl font-semibold text-indigo-600 mb-3">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              Become a trusted learning hub where every student receives equal opportunity to grow intellectually
              and emotionally, preparing them for future challenges with strong values and knowledge.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section ref={addToRefs} className="py-20 bg-indigo-50 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-800 fade-up">
          Why Students Choose <span className="text-indigo-600">LKD Classes</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: "📘", title: "Expert Faculty", desc: "Highly experienced teachers who simplify complex topics." },
            { icon: "⏰", title: "Structured Learning", desc: "Systematic teaching schedule with regular tests & feedback." },
            { icon: "🏆", title: "Result-Oriented", desc: "Proven record of top ranks, personal attention, continuous improvement." },
          ].map((item, index) => (
            <div key={index} className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition fade-up">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-indigo-600 mb-2">{item.title}</h3>
              <p className="text-gray-700">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder Message */}
      <section ref={addToRefs} className="py-20 bg-white px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 items-center gap-10 fade-up">
          <div className="flex justify-center">
            <Image
              src="/images/founder.png"
              alt="Founder"
              width={350}
              height={350}
              className="rounded-full shadow-2xl object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-4">Message from the Founder</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              "Education is not just about learning subjects; it's about building strong character,
              discipline, and curiosity. At LKD Classes, we combine traditional teaching with modern
              methods to help every student reach their full potential."
            </p>
            <p className="font-semibold text-indigo-800">— Laliteshwar Kumar, Founder</p>
          </div>
        </div>
      </section>

      {/* Map & Contact */}
      <section ref={addToRefs} className="relative py-20 bg-gradient-to-r from-indigo-50 to-blue-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12 fade-up">
            <h2 className="text-4xl font-bold text-indigo-700 mb-3">Visit LKD Classes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We’re located in the heart of <b>Sitalpur, Saran, Bihar</b> — a place where excellence meets discipline.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100 text-left fade-up">
              <h3 className="text-2xl font-semibold text-indigo-600 mb-4">Contact Information</h3>
              <p className="text-gray-700 mb-3"><strong>Address:</strong> Parsa Road, Sitalpur, Saran, Bihar, India</p>
              <p className="text-gray-700 mb-3"><strong>Phone:</strong> +918002271522</p>
              <p className="text-gray-700 mb-3"><strong>Email:</strong> lkdclasses@gmail.com</p>
              {/* Social Media */}
              <div className="flex gap-4 mb-6">
                <a
                  href="https://www.facebook.com/lkdclasses/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-2xl hover:text-blue-800 transition"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="https://www.youtube.com/channel/UCWx3KGDeUtbF_gQVsSnmNcw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 text-2xl hover:text-red-700 transition"
                >
                  <FaYoutube />
                </a>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="/register" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow hover:bg-indigo-700 transition">Enroll Now</a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=26.862166,80.999789" target="_blank" rel="noopener noreferrer" className="bg-yellow-400 text-indigo-900 px-6 py-3 rounded-xl font-medium shadow hover:bg-yellow-500 transition">Get Directions</a>
              </div>
            </div>

            <div className="relative w-full h-[300px] md:h-[300px] rounded-2xl overflow-hidden shadow-xl border border-indigo-100 fade-up">
             <iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3593.011735557051!2d85.02835908201455!3d25.77017591893639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed4e02d0e749e1%3A0x9caafe27ffd6a2e1!2sLKD%20CLASSES!5e0!3m2!1sen!2sin!4v1759696882743!5m2!1sen!2sin"
  width="100%"
  height="100%"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
></iframe>

              <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={addToRefs} className="py-16 bg-gradient-to-r from-indigo-500 to-blue-400 text-white text-center fade-up">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Join LKD Classes Today</h2>
        <p className="max-w-3xl mx-auto mb-8 opacity-90 text-lg fade-up">
          Be part of a learning environment that values growth, mentorship, and success.
        </p>
        <a href="/register" className="bg-yellow-400 text-indigo-900 px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition fade-up">Enroll Now</a>
      </section>

      <Footer />
    </>
  );
}



