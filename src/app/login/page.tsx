"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = await createClient();
    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setError("Authentication failed. No user returned.");
        setLoading(false);
        return;
      }

      // 2. Check if user is an admin
      const { data: adminAccount, error: adminError } = await supabase
        .from("admin_accounts")
        .select("id, role_id")
        .eq("user_id", userId)
        .single();

      if (adminError || !adminAccount) {
        // Non-admin user — redirect to logged-in page
        router.push("/home");
        return;
      }

      // 3. Fetch role info including infrastructure access flags
      const { data: adminRole } = await supabase
        .from("admin_roles")
        .select("role_name, access_terminal, access_network")
        .eq("id", adminAccount.role_id)
        .single();

      // 4. Check admin privileges exist
      const { data: privileges } = await supabase
        .from("admin_privileges")
        .select("privilege_key")
        .eq("admin_id", adminAccount.id);

      const hasPrivileges = privileges && privileges.length > 0;

      if (!hasPrivileges) {
        // Admin without privileges — redirect to logged-in page
        router.push("/home");
        return;
      }

      // Merge individual privileges with role-level infra access
      const privilegeKeys = privileges.map((p: { privilege_key: string }) => p.privilege_key);
      if (adminRole?.access_terminal && !privilegeKeys.includes("access_terminal")) {
        privilegeKeys.push("access_terminal");
      }
      if (adminRole?.access_network && !privilegeKeys.includes("access_network")) {
        privilegeKeys.push("access_network");
      }

      // Store admin info in localStorage for dashboard use
      localStorage.setItem(
        "admin_session",
        JSON.stringify({
          user_id: userId,
          admin_id: adminAccount.id,
          role: adminRole?.role_name || "unknown",
          privileges: privilegeKeys,
        })
      );

      router.push("/");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Magic Users</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Dashboard Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="admin@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
