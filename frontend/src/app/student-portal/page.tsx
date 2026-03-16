"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Sidebar from "./components/sidebar";
import ProfileSection from "./components/ProfileSection";
import ResultsSection from "./components/ResultsSection";
import PaymentsSection from "./components/PaymentsSection";
import { authService } from "@/services/authService";

function StudentDashboardContent() {
  const { user, loading } = useAuth("student");
  const [activeSection, setActiveSection] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const section = String(searchParams.get("section") ?? "").trim().toLowerCase();
    if (section === "payments" || section === "results" || section === "profile") {
      setActiveSection(section);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeSection !== "logout") return;
    void authService.logout().finally(() => {
      window.location.href = "/login";
    });
  }, [activeSection]);

  if (loading) return <div className="p-10 text-center text-gray-600">Loading...</div>;

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection />;
      case "payments":
        return <PaymentsSection />;
      case "results":
        return <ResultsSection />;
      case "logout":
        return (
          <div className="bg-white p-6 rounded-2xl shadow-lg text-gray-600">
            Logging out...
          </div>
        );
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:block">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      </div>

      <div className="md:hidden fixed top-0 left-0 w-full bg-white shadow-md z-50 flex justify-between items-center p-4">
        <h1 className="text-lg font-bold text-indigo-600">LKD Portal</h1>
        <button
          onClick={() => setSidebarOpen(true)}
          className="bg-indigo-600 text-white p-2 rounded-md shadow"
        >
          ?
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative bg-white w-64 h-full shadow-xl transform transition-transform duration-300">
            <Sidebar
              activeSection={activeSection}
              setActiveSection={(section) => {
                setActiveSection(section);
                setSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      <main className="flex-1 p-6 md:ml-64 mt-16 md:mt-0 transition-all duration-300">
        {renderSection()}
      </main>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <StudentDashboardContent />
    </Suspense>
  );
}
