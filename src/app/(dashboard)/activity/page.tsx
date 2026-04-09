"use client";

import { useState, useEffect } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";

const tabs = ["Active Sessions", "Access Log"] as const;
type Tab = typeof tabs[number];

export default function ActivityPage() {
  const { loading } = useAuthGuard();
  const [activeTab, setActiveTab] = useState<Tab>("Active Sessions");

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--crimson)", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium mb-1" style={{ color: "var(--crimson)" }}>Monitoring</p>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Activity</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Live sessions and privilege change audit log</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl w-fit mb-6" style={{ background: "var(--silver-100)" }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style={{
              background: activeTab === tab ? "var(--surface)" : "transparent",
              color: activeTab === tab ? "var(--crimson)" : "var(--text-2)",
              boxShadow: activeTab === tab ? "var(--shadow-sm)" : "none",
            }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Active Sessions" && <SessionsTab />}
      {activeTab === "Access Log" && <AccessLogTab />}
    </div>
  );
}

function SessionsTab() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = () => {
    setLoading(true);
    fetch("/api/sessions")
      .then(r => r.json())
      .then(d => setSessions(Array.isArray(d) ? d : []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSessions(); }, []);

  const terminate = async (id: string) => {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    fetchSessions();
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {loading ? "—" : sessions.length} live sessions
          </span>
        </span>
      </div>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["User", "IP Address", "Device", "Location", "Started", ""].map(h => (
              <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} className="px-6 py-8 text-center text-sm" style={{ color: "var(--text-3)" }}>Loading…</td></tr>
          ) : sessions.map((s, i) => (
            <tr key={s.id} className="transition-colors"
              style={{ borderBottom: i < sessions.length - 1 ? "1px solid var(--border)" : "none" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
              <td className="px-6 py-4">
                <div className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{s.user_name}</div>
              </td>
              <td className="px-6 py-4 text-sm font-mono" style={{ color: "var(--text-2)" }}>{s.ip_address}</td>
              <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>{s.device}</td>
              <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>{s.location ?? "—"}</td>
              <td className="px-6 py-4 text-sm" style={{ color: "var(--text-3)" }}>{new Date(s.started_at).toLocaleString()}</td>
              <td className="px-6 py-4">
                <button onClick={() => terminate(s.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: "var(--crimson-50)", color: "var(--crimson)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson-100)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson-50)"}>
                  Terminate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && sessions.length === 0 && (
        <div className="py-12 text-center text-sm" style={{ color: "var(--text-3)" }}>No active sessions.</div>
      )}
    </div>
  );
}

function AccessLogTab() {
  const [actionFilter, setActionFilter] = useState("all");
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (actionFilter !== "all") params.set("action", actionFilter);
    fetch(`/api/access-log?${params}`)
      .then(r => r.json())
      .then(d => setEntries(d.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [actionFilter]);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
          className="px-4 py-2 text-sm rounded-xl border"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text-1)", outline: "none" }}>
          <option value="all">All Actions</option>
          <option value="granted">Granted</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["User", "Action", "Item", "Performed By", "Timestamp"].map(h => (
              <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} className="px-6 py-8 text-center text-sm" style={{ color: "var(--text-3)" }}>Loading…</td></tr>
          ) : entries.map((e, i) => (
            <tr key={e.id} className="transition-colors"
              style={{ borderBottom: i < entries.length - 1 ? "1px solid var(--border)" : "none" }}
              onMouseEnter={el => (el.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
              onMouseLeave={el => (el.currentTarget as HTMLElement).style.background = "transparent"}>
              <td className="px-6 py-4 text-sm font-semibold" style={{ color: "var(--text-1)" }}>{e.user_name}</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={e.action === "granted" ? { background: "#F0FDF4", color: "#15803D" } : { background: "var(--crimson-50)", color: "var(--crimson)" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: e.action === "granted" ? "#22C55E" : "var(--crimson)" }}/>
                  {e.action}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-mono" style={{ color: "var(--text-2)" }}>{e.item}</td>
              <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>{e.performed_by_name}</td>
              <td className="px-6 py-4 text-sm" style={{ color: "var(--text-3)" }}>{new Date(e.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && entries.length === 0 && (
        <div className="py-12 text-center text-sm" style={{ color: "var(--text-3)" }}>No entries found.</div>
      )}
    </div>
  );
}
