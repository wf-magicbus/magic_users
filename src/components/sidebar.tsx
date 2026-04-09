"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/users", label: "Users", icon: "👥" },
  { href: "/administration", label: "Administration", icon: "👤" },
  { href: "/policies", label: "Policies", icon: "🛡️" },
  { href: "/activity", label: "Activity", icon: "📋" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("admin_session");
    router.push("/login");
  }

  return (
    <aside
      style={{
        width: "240px",
        background: "#ffffff",
        minHeight: "100vh",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(180, 145, 32, 0.22)",
        boxShadow: "2px 0 8px rgba(90, 70, 0, 0.06)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid rgba(180, 145, 32, 0.16)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              background: "linear-gradient(135deg, #f4c430, #d4a017)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "700",
              fontSize: "18px",
              boxShadow: "0 1px 3px rgba(90, 70, 0, 0.08)",
              flexShrink: 0,
            }}
          >
            S
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#2f2a1f", lineHeight: 1.2 }}>
              Security Admin
            </div>
            <div style={{ fontSize: "11px", color: "#6f6653", marginTop: "2px" }}>
              User Management
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 12px" }}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                marginBottom: "2px",
                fontSize: "14px",
                fontWeight: isActive ? "600" : "500",
                color: isActive ? "#2f2a1f" : "#6f6653",
                background: isActive
                  ? "rgba(244, 196, 48, 0.18)"
                  : "transparent",
                borderLeft: isActive
                  ? "3px solid #f4c430"
                  : "3px solid transparent",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "rgba(244, 196, 48, 0.08)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#2f2a1f";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#6f6653";
                }
              }}
            >
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(180, 145, 32, 0.16)" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "transparent",
            border: "1px solid rgba(180, 145, 32, 0.22)",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            color: "#6f6653",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(214, 69, 69, 0.08)";
            (e.currentTarget as HTMLButtonElement).style.color = "#d64545";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(214, 69, 69, 0.22)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#6f6653";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(180, 145, 32, 0.22)";
          }}
        >
          <span>↩</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
