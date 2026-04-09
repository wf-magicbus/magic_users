"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/lib/use-auth-guard";

const statusMap: Record<string, { bg: string; color: string; dot: string }> = {
  active:   { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  locked:   { bg: "#FFF0F5", color: "#B8003C", dot: "#E4004B" },
  disabled: { bg: "#F4F5F6", color: "#5A6478", dot: "#C9CDCF" },
};

export default function UsersPage() {
  const { loading: authLoading } = useAuthGuard();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ active: 0, locked: 0, disabled: 0 });
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  // Fetch counts separately (always all statuses)
  useEffect(() => {
    fetch("/api/users?limit=200")
      .then(r => r.json())
      .then(data => {
        const all = data.users ?? [];
        setCounts({
          active: all.filter((u: any) => u.status === "active").length,
          locked: all.filter((u: any) => u.status === "locked").length,
          disabled: all.filter((u: any) => u.status === "disabled").length,
        });
      }).catch(() => {});
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  if (authLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--crimson)", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium mb-1" style={{ color: "var(--crimson)" }}>Directory</p>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Users</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>{total} total accounts in the system</p>
      </div>

      <div className="flex gap-3 mb-6">
        {[
          { label: "Active", count: counts.active, bg: "#F0FDF4", color: "#15803D", val: "active" },
          { label: "Locked", count: counts.locked, bg: "#FFF0F5", color: "#B8003C", val: "locked" },
          { label: "Disabled", count: counts.disabled, bg: "#F4F5F6", color: "#5A6478", val: "disabled" },
        ].map(chip => (
          <div key={chip.label}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
            style={{ background: statusFilter === chip.val ? chip.bg : "var(--silver-50)", color: statusFilter === chip.val ? chip.color : "var(--text-3)" }}
            onClick={() => setStatusFilter(statusFilter === chip.val ? "all" : chip.val)}>
            {chip.count} {chip.label}
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
        <div className="px-5 py-4 flex flex-wrap gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="relative flex-1 min-w-[200px]">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }}>
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input type="text" placeholder="Search users..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border transition-all"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text-1)", outline: "none" }}
              onFocus={e => (e.target.style.borderColor = "var(--crimson)")}
              onBlur={e => (e.target.style.borderColor = "var(--border-strong)")}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-sm rounded-xl border"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text-1)", outline: "none" }}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["User", "Status", "Role", "Last Login", "MFA"].map(h => (
                <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm" style={{ color: "var(--text-3)" }}>Loading…</td></tr>
            ) : users.map((user, i) => {
              const s = statusMap[user.status] || statusMap.disabled;
              return (
                <tr key={user.user_id} className="transition-colors"
                  style={{ borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: "var(--crimson-50)", color: "var(--crimson)" }}>
                        {user.name?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <Link href={`/users/${user.user_id}`}
                          className="text-sm font-semibold transition-colors"
                          style={{ color: "var(--text-1)" }}
                          onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--crimson)"}
                          onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--text-1)"}>
                          {user.name}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
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
                    ) : <span style={{ color: "var(--text-3)" }}>—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold" style={{ color: user.mfa_enabled ? "#15803D" : "var(--text-3)" }}>
                      {user.mfa_enabled ? "Enabled" : "Off"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!loading && users.length === 0 && (
          <div className="py-16 text-center">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--silver)" }}>
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zM3 17a7 7 0 0114 0H3z"/>
            </svg>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>No users match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
