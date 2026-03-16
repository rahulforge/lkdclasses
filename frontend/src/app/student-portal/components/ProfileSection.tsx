"use client";

import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { classService } from "@/services/classService";

type ProfileState = {
  rollNo: string;
  name: string;
  className: string;
  phone: string;
};

export default function ProfileSection() {
  const [profile, setProfile] = useState<ProfileState>({
    rollNo: "-",
    name: "-",
    className: "-",
    phone: "-",
  });

  useEffect(() => {
    const run = async () => {
      const session = authService.getStoredSession();
      if (!session) return;

      const classes = await classService.getClasses();
      const className = classes.find((item) => item.id === session.classId)?.name ?? "-";

      setProfile({
        rollNo: session.rollNumber ?? "Pending",
        name: session.name || "-",
        className,
        phone: session.phone || "-",
      });
    };

    void run();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Profile</h2>
      <ul className="space-y-2 text-gray-700">
        <li><b>Roll No:</b> {profile.rollNo}</li>
        <li><b>Name:</b> {profile.name}</li>
        <li><b>Class:</b> {profile.className}</li>
        <li><b>Phone:</b> {profile.phone}</li>
      </ul>
    </div>
  );
}
