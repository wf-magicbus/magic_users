"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface AdminSession {
  user_id: string;
  admin_id: string;
  role: string;
  privileges: string[];
}

export function useAuthGuard() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const stored = localStorage.getItem("admin_session");
      if (!stored) {
        router.replace("/login");
        return;
      }

      try {
        const parsed = JSON.parse(stored) as AdminSession;
        setAdminSession(parsed);
      } catch {
        router.replace("/login");
        return;
      }

      setLoading(false);
    }

    checkAuth();
  }, [router]);

  return { adminSession, loading };
}
