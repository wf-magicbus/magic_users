"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/users", label: "Users" },
  { href: "/administration", label: "Administration" },
  { href: "/policies", label: "Policies" },
  { href: "/activity", label: "Activity" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("admin_session");
    router.push("/login");
  }

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex-shrink-0 flex flex-col">
      <h1 className="text-xl font-bold mb-8 px-3">Magic Users</h1>
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded text-sm ${
                isActive ? "bg-gray-700 text-white font-medium" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="w-full px-3 py-2 mt-4 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded text-left transition-colors"
      >
        Sign Out
      </button>
    </aside>
  );
}
