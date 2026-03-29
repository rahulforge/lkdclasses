"use client";

import { motion } from "framer-motion";
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineCreditCard,
  HiOutlineDocumentReport,
  HiOutlineBadgeCheck,
  HiOutlineAcademicCap,
  HiOutlineCollection,
  HiOutlineVideoCamera,
  HiOutlineBell,
  HiOutlineChatAlt2,
  HiOutlineLogout,
} from "react-icons/hi";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeSection, setActiveSection, onLogout }: SidebarProps) {
  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <HiOutlineHome /> },
    { key: "students", label: "Students", icon: <HiOutlineUserGroup /> },
    { key: "payments", label: "Payments", icon: <HiOutlineCreditCard /> },
    { key: "results", label: "Results", icon: <HiOutlineDocumentReport /> },
    { key: "certificates", label: "Certificates", icon: <HiOutlineBadgeCheck /> },
    { key: "events", label: "Events", icon: <HiOutlineAcademicCap /> },
    { key: "gallery", label: "Gallery", icon: <HiOutlineCollection /> },
    { key: "youtube", label: "YouTube", icon: <HiOutlineVideoCamera /> },
    { key: "notifications", label: "Notifications", icon: <HiOutlineBell /> },
    { key: "chatbot", label: "Chatbot Knowledge", icon: <HiOutlineChatAlt2 /> },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-64 bg-white border-r h-screen shadow-xl fixed left-0 top-0 z-50 py-6"
    >
      <div className="px-6 mb-6">
        <h1 className="text-2xl font-bold text-indigo-600">Admin Panel</h1>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveSection(item.key)}
            className={`flex items-center gap-3 px-6 py-3 text-left text-sm font-medium rounded-lg transition-all duration-200
              ${activeSection === item.key
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-4 border-t px-6 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
          <HiOutlineLogout className="text-lg" />
          Logout
        </button>
        <div className="pt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} LKD Classes
        </div>
      </div>
    </motion.aside>
  );
}
