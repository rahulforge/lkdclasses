"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import DashboardOverview from "./components/DashboardOverview";
import StudentsSection from "./components/StudentsSection";
import PaymentsSection from "./components/PaymentsSection";
import ResultsSection from "./components/ResultsSection";
import CertificatesSection from "./components/CertificatesSection";
import EventsSection from "./components/EventsSection";
import GallerySection from "./components/GallerySection";
import YouTubeSection from "./components/YouTubeSection";
import NotificationsSection from "./components/NotificationsSection";
import ChatbotKnowledgeSection from "./components/ChatbotKnowledgeSection";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

export default function Admin() {
  const { user, loading } = useAuth("admin");
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      router.replace("/login");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-600">Loading...</div>;

  const renderSection = () => {
  switch (activeSection) {
    case "dashboard":
      return <DashboardOverview setActiveSection={setActiveSection} />;
    case "students":
      return <StudentsSection />;
    case "payments":
      return <PaymentsSection />;
    case "results":
      return <ResultsSection />;
    case "certificates":
      return <CertificatesSection />;
    case "events":
      return <EventsSection />;
    case "gallery":
      return <GallerySection />;
    case "youtube":
      return <YouTubeSection />;
    case "notifications":
      return <NotificationsSection />;
    case "chatbot":
      return <ChatbotKnowledgeSection />;
    default:
      return <DashboardOverview setActiveSection={setActiveSection} />;
  }
};


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} onLogout={handleLogout} />
      </aside>

    {/* Mobile Hamburger Top Bar */}
<div className="md:hidden fixed top-4 left-4 right-4  flex justify-between items-center bg-white p-2 shadow-md rounded-lg">
  <span className="text-indigo-600 font-bold text-lg">Admin Panel</span>
  <button
    onClick={() => setSidebarOpen(!sidebarOpen)}
    className="bg-indigo-600 text-white p-3 rounded-md shadow flex items-center justify-center"
  >
    {sidebarOpen ? <HiOutlineX size={22} /> : <HiOutlineMenu size={22} />}
  </button>
</div>


      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Slide Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="relative w-64 h-full bg-white shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              activeSection={activeSection}
              setActiveSection={(section) => {
                setActiveSection(section);
                setSidebarOpen(false);
              }}
              onLogout={handleLogout}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-64 mt-16 md:mt-0 transition-all duration-300">
        {renderSection()}
      </main>
    </div>
  );
}
