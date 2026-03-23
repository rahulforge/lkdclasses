"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { COURSE_PRICING } from "@/config/coursePricing";
import { FaCheckCircle, FaGraduationCap } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

const courses = COURSE_PRICING.map((item) => ({
  grade: item.label,
  icon: <FaGraduationCap className="text-indigo-600" />,
  subjects: ["Hindi", "English", "Math", "Science"],
  description: "Monthly learning plan with weekly practice and doubt support.",
  benefits: [
    "Weekly practice papers and assignments",
    "Monthly tests and performance review",
    "Doubt-solving sessions",
    "Study materials and notes",
  ],
  monthlyFee: item.pricing.monthly,
}));
const payLink = `/login?next=${encodeURIComponent("/student-portal?section=payments")}`;

export default function CoursesClient() {
  const [selectedCourse, setSelectedCourse] = useState<(typeof courses)[0] | null>(null);
  const benefitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCourse && benefitRef.current) {
      gsap.fromTo(
        benefitRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out" }
      );
    }
  }, [selectedCourse]);

  return (
    <>
      <Navbar />

      <section className="relative py-28 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-center overflow-hidden">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Our Courses</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed mb-8">
          Select your class and view the monthly fee.
        </p>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white rounded-t-[50%]" />
      </section>

      {selectedCourse === null && (
        <section className="py-10 bg-indigo-50 px-6 md:px-12 -mt-12 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
            {courses.map((course, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 transition transform hover:scale-105 flex flex-col items-center justify-center"
              >
                <div className="bg-indigo-100 rounded-full w-20 h-20 flex items-center justify-center text-4xl md:text-5xl mb-4 shadow">
                  {course.icon}
                </div>
                <h3 className="text-2xl font-bold text-indigo-600 mb-2">{course.grade}</h3>
                <p className="text-gray-700 text-center mb-2">{course.description}</p>
                <p className="text-gray-500 text-sm mb-3 font-medium">Subjects: {course.subjects.join(", ")}</p>
                <div className="w-full space-y-2 mb-4">
                  <div className="border rounded-lg px-3 py-2 text-left bg-indigo-50">
                    <p className="text-sm font-semibold text-indigo-700">Monthly</p>
                    <p className="text-xs text-gray-700">Fee: Rs {course.monthlyFee}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={`/register?class=${encodeURIComponent(course.grade)}&plan=monthly`}
                        data-cta="enroll_course_card"
                        data-class={course.grade}
                        data-plan="monthly"
                        className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-semibold flex-1 text-center"
                      >
                        Enroll
                      </a>
                      <a
                        href={payLink}
                        data-cta="pay_fees_course_card"
                        data-class={course.grade}
                        className="bg-yellow-400 text-indigo-900 px-3 py-1 rounded-lg text-xs font-semibold flex-1 text-center"
                      >
                        Pay Fees
                      </a>

                    </div>
                  </div>
                </div>
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition"
                  onClick={() => setSelectedCourse(course)}
                >
                  Select Course
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedCourse && (
        <section className="pb-16 bg-white px-6 md:px-12 -mt-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 shadow-2xl relative text-center">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold text-2xl"
              onClick={() => setSelectedCourse(null)}
            >
              ×
            </button>

            <div className="bg-indigo-100 rounded-full w-24 h-24 md:w-32 md:h-32 flex items-center justify-center text-6xl md:text-7xl mb-6 shadow-lg mx-auto">
              {selectedCourse.icon}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-4">
              {selectedCourse.grade} - Course Details
            </h2>
            <p className="text-gray-800 mb-4">{selectedCourse.description}</p>
            <div className="max-w-xl mx-auto text-left bg-white rounded-xl p-4 mb-6 border">
              <p className="font-semibold text-indigo-700 mb-2">Monthly Plan:</p>
              <p className="text-sm">
                <b>Monthly:</b> Rs {selectedCourse.monthlyFee}
              </p>
            </div>

            <div ref={benefitRef} className="text-left max-w-xl mx-auto mb-6">
              <h3 className="text-xl font-semibold text-indigo-600 mb-3">What you will get:</h3>
              <ul className="list-none space-y-3">
                {selectedCourse.benefits.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-amber-500 mr-3 text-xl">
                      <FaCheckCircle />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={`/register?class=${encodeURIComponent(selectedCourse.grade)}&plan=monthly`}
              data-cta="enroll_course_detail"
              data-class={selectedCourse.grade}
              data-plan="monthly"
              className="bg-yellow-400 text-indigo-900 px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition inline-block"
            >
              Enroll
            </a>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
