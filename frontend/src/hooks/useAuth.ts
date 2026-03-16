"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, type SessionUser, type AuthRole } from "@/services/authService";

export default function useAuth(role: AuthRole) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const current = authService.getStoredSession();
        if (!current) {
          router.replace("/login");
          return;
        }

        const fresh = await authService.refreshSession();
        const resolved = fresh ?? current;

        if (resolved.role !== role) {
          router.replace("/login");
          return;
        }

        if (mounted) {
          setUser(resolved);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [role, router]);

  return { user, loading };
}
