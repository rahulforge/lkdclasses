"use client";

import { useEffect, useState } from "react";
import { noticeService, type NoticeItem } from "@/services/noticeService";

export default function NotificationsSection() {
  const [notifications, setNotifications] = useState<NoticeItem[]>([]);

  useEffect(() => {
    void noticeService.getLatest(5).then(setNotifications).catch(() => setNotifications([]));
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-700 mb-4">Notifications</h2>
      <div className="space-y-4">
        {notifications.length === 0 && <p className="text-gray-500">No notifications available.</p>}
        {notifications.map((note) => (
          <div key={note.id} className="bg-white rounded-2xl shadow p-4 hover:shadow-xl transition">
            <h3 className="font-semibold text-lg">{note.title}</h3>
            <p className="text-gray-600">{new Date(note.createdAt).toLocaleDateString()}</p>
            <p className="text-gray-700 mt-1">{note.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
