"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navSections = [
  {
    label: "Overview",
    items: [
      {
        href: "/",
        label: "Dashboard",
        soon: false,
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
            <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 10a3 3 0 01-3 3 1 1 0 110-2 1 1 0 000-2 1 1 0 00-1 1 1 1 0 11-2 0 3 3 0 013-3z" />
          </svg>
        ),
      },
      {
        href: "/users",
        label: "Users",
        soon: false,
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zM3 17a7 7 0 0114 0H3z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        href: "/administration",
        label: "Administration",
        soon: false,
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        href: "/policies",
        label: "Policies",
        soon: false,
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        href: "/roles",
        label: "Roles",
        soon: false,
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
          </svg>
        ),
      },
      {
        href: "/activity",
        label: "Activity",
        soon: false,
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      {
        href: "/network",
        label: "Network",
        soon: false,
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        href: "/terminal",
        label: "Terminal",
        soon: false,
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
  },
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
      className="w-[220px] flex-shrink-0 flex flex-col min-h-screen"
      style={{ background: "#000000" }}
    >
      {/* Brand */}
      <div className="px-5 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#dc2626" }}
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight tracking-wide">MagicBus</div>
            <div className="text-xs leading-tight" style={{ color: "#999999" }}>Admin Console</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <div
              className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: "#888888" }}
            >
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.soon ? "#" : item.href}
                    onClick={(e) => item.soon && e.preventDefault()}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group"
                    style={{
                      color: isActive ? "white" : item.soon ? "#888888" : "#cccccc",
                      background: isActive ? "#dc2626" : "transparent",
                      cursor: item.soon ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive && !item.soon) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                        (e.currentTarget as HTMLElement).style.color = "white";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive && !item.soon) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "#cccccc";
                      }
                    }}
                  >
                    <span className={isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"}>
                      {item.icon}
                    </span>
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.soon && (
                      <span
                        className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(255,255,255,0.08)", color: "#888888" }}
                      >
                        Soon
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
          style={{ color: "#888888" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLElement).style.color = "#cccccc";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#888888";
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px] flex-shrink-0">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
