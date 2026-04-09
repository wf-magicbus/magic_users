"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";

const statusStyles: Record<string, { bg: string; color: string; dot: string }> = {
  active:   { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  locked:   { bg: "#FFF0F5", color: "#B8003C", dot: "#E4004B" },
  disabled: { bg: "#F4F5F6", color: "#5A6478", dot: "#C9CDCF" },
};

function StatCard({ label, value, sub, iconBg, iconColor, icon }: {
  label: string; value: string | number; sub: string;
  iconBg: string; iconColor: string; icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold mb-0.5" style={{ color: "var(--text-1)" }}>{value}</div>
      <div className="text-sm font-medium mb-0.5" style={{ color: "var(--text-1)" }}>{label}</div>
      <div className="text-xs" style={{ color: "var(--text-3)" }}>{sub}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { loading } = useAuthGuard();
  const [stats, setStats] = useState({ total: 0, active: 0, locked: 0, sessions: 0, admins: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/users?limit=100").then(r => r.json()),
      fetch("/api/sessions").then(r => r.json()),
      fetch("/api/admins").then(r => r.json()),
    ]).then(([usersRes, sessionsRes, adminsRes]) => {
      const users = usersRes.users ?? [];
      const sessions = Array.isArray(sessionsRes) ? sessionsRes : [];
      setStats({
        total: usersRes.total ?? users.length,
        active: users.filter((u: any) => u.status === "active").length,
        locked: users.filter((u: any) => u.status === "locked").length,
        sessions: sessions.length,
        admins: adminsRes.count ?? 0,
      });
      setRecentUsers(users.slice(0, 5));
    }).catch(() => {}).finally(() => setDataLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--crimson)", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium mb-1" style={{ color: "var(--crimson)" }}>Welcome back</p>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>System Overview</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>MagicBus Admin Console — real-time security dashboard</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={dataLoading ? "—" : stats.total}
          sub={`${stats.active} active accounts`}
          iconBg="var(--sky-50)" iconColor="var(--sky-dark)"
          icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zM3 17a7 7 0 0114 0H3z"/></svg>}
        />
        <StatCard
          label="Active Sessions"
          value={dataLoading ? "—" : stats.sessions}
          sub="currently live"
          iconBg="#F0FDF4" iconColor="#15803D"
          icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 00.808 9.636c3.515-3.515 9.233-3.515 12.748 0 .293.293.677.44 1.06.44s.767-.146 1.06-.44a1 1 0 000-1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 101.414 1.414 5 5 0 017.072 0 1 1 0 101.414-1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 101.414 1.415 1 1 0 011.414 0 1 1 0 101.414-1.415zM11 17a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd"/></svg>}
        />
        <StatCard
          label="Locked Accounts"
          value={dataLoading ? "—" : stats.locked}
          sub="require attention"
          iconBg="var(--crimson-50)" iconColor="var(--crimson)"
          icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>}
        />
        <StatCard
          label="Admin Accounts"
          value={dataLoading ? "—" : stats.admins}
          sub="privileged users"
          iconBg="var(--gold-50)" iconColor="var(--gold-dark)"
          icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
        />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>Recent Users</h2>
          <a href="/users" className="text-xs font-semibold transition-colors" style={{ color: "var(--crimson)" }}>View all →</a>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["User", "Status", "Role", "Last Login"].map(h => (
                <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataLoading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-sm" style={{ color: "var(--text-3)" }}>Loading…</td></tr>
            ) : recentUsers.map((user, i) => {
              const s = statusStyles[user.status] || statusStyles.disabled;
              return (
                <tr key={user.user_id} className="transition-colors"
                  style={{ borderBottom: i < recentUsers.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "var(--crimson-50)", color: "var(--crimson)" }}>
                        {user.name?.charAt(0) ?? "?"}
                      </div>
                      <div className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{user.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: s.bg, color: s.color }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role ? (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: "var(--sky-50)", color: "var(--sky-dark)" }}>
                        {user.role.replace(/_/g, " ")}
                      </span>
                    ) : <span className="text-xs" style={{ color: "var(--text-3)" }}>—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!dataLoading && recentUsers.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: "var(--text-3)" }}>No users found.</div>
        )}
      </div>
    </div>
  );
}
