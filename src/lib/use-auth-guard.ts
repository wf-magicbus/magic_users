"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AdminSession {
  user_id: string;
  admin_id: string;
  role: string;
  privileges: string[];
}

export function hasPrivilege(session: AdminSession | null, privilege: string): boolean {
  if (!session) return false;
  if (session.role === "super_admin") return true;
  return session.privileges.includes(privilege);
}

export function useAuthGuard(requiredPrivilege?: string) {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const supabase = await createClient();
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

      let parsed: AdminSession;
      try {
        parsed = JSON.parse(stored) as AdminSession;
      } catch {
        router.replace("/login");
        return;
      }

      // If this page requires a specific privilege, check it
      if (requiredPrivilege && !hasPrivilege(parsed, requiredPrivilege)) {
        router.replace("/");
        return;
      }

      setAdminSession(parsed);
      setLoading(false);
    }

    checkAuth();
  }, [router, requiredPrivilege]);

  return { adminSession, loading };
}
