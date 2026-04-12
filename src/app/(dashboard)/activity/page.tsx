"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";

const SESSIONS_TAB = "Active Sessions";
const LOG_TAB = "Access Log";
type Tab = typeof SESSIONS_TAB | typeof LOG_TAB;

interface Session {
  id: string;
  user_id?: string;
  ip_address?: string;
  device?: string;
  location?: string;
  started_at?: string;
  ended_at?: string;
  is_active?: boolean;
}

interface AccessLogEntry {
  id: string;
  user_name?: string;
  userName?: string;
  action: string;
  item?: string;
  resource?: string;
  performed_by_name?: string;
  performedBy?: string;
  timestamp?: string;
  created_at?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ActivityPage() {
  const { loading } = useAuthGuard();
  const [activeTab, setActiveTab] = useState<Tab>(SESSIONS_TAB);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [accessLog, setAccessLog] = useState<AccessLogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingLog, setLoadingLog] = useState(true);
  const [sessionSearch, setSessionSearch] = useState("");
  const [logSearch, setLogSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [logPage, setLogPage] = useState(1);

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/sessions");
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : data.sessions || []);
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const fetchAccessLog = useCallback(async (page = 1, action = "all") => {
    setLoadingLog(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (action !== "all") params.set("action", action);
      const res = await fetch(`/api/access-log?${params}`);
      if (!res.ok) throw new Error("Failed to fetch access log");
      const data = await res.json();
      setAccessLog(Array.isArray(data) ? data : data.entries || []);
      if (data.pagination) setPagination(data.pagination);
    } catch {
      setAccessLog([]);
    } finally {
      setLoadingLog(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchAccessLog(1, "all");
  }, [fetchSessions, fetchAccessLog]);

  const handleTerminate = async (sessionId: string) => {
    if (!confirm("Terminate this session?")) return;
    try {
      await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      await fetchSessions();
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleTerminateAll = async () => {
    if (!confirm("Terminate all active sessions?")) return;
    try {
      await Promise.all(sessions.map((s) => fetch(`/api/sessions/${s.id}`, { method: "DELETE" })));
      await fetchSessions();
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const q = sessionSearch.toLowerCase();
    if (!q) return true;
    return (
      (s.ip_address || "").toLowerCase().includes(q) ||
      (s.device || "").toLowerCase().includes(q) ||
      (s.location || "").toLowerCase().includes(q)
    );
  });

  const filteredLog = accessLog.filter((e) => {
    const q = logSearch.toLowerCase();
    if (!q) return true;
    return (
      (e.user_name || e.userName || "").toLowerCase().includes(q) ||
      (e.item || e.resource || "").toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q)
    );
  });

  if (loading) return <div className="loading-text">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="page-header-icon">A</div>
            <h1 className="page-title">Activity</h1>
          </div>
          <p className="page-subtitle">Monitor active sessions and access log activity</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="tab-bar mb-8">
          {([SESSIONS_TAB, LOG_TAB] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="golden-tab px-5 py-2 rounded text-sm"
              style={{ fontWeight: "600", color: activeTab === tab ? "#ffffff" : "#6f6653", background: activeTab === tab ? "#f4c430" : "transparent" }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === SESSIONS_TAB && (
          <SessionsTab
            sessions={filteredSessions}
            allSessions={sessions}
            search={sessionSearch}
            setSearch={setSessionSearch}
            loading={loadingSessions}
            onTerminate={handleTerminate}
            onTerminateAll={handleTerminateAll}
            onRefresh={fetchSessions}
          />
        )}
        {activeTab === LOG_TAB && (
          <AccessLogTab
            entries={filteredLog}
            allEntries={accessLog}
            search={logSearch}
            setSearch={setLogSearch}
            actionFilter={actionFilter}
            setActionFilter={(v: string) => { setActionFilter(v); setLogPage(1); fetchAccessLog(1, v); }}
            pagination={pagination}
            currentPage={logPage}
            onPageChange={(p: number) => { setLogPage(p); fetchAccessLog(p, actionFilter); }}
            loading={loadingLog}
            onRefresh={() => fetchAccessLog(logPage, actionFilter)}
          />
        )}
      </div>
    </div>
  );
}

function SessionsTab({ sessions, allSessions, search, setSearch, loading, onTerminate, onTerminateAll, onRefresh }: {
  sessions: Session[];
  allSessions: Session[];
  search: string;
  setSearch: (v: string) => void;
  loading: boolean;
  onTerminate: (id: string) => void;
  onTerminateAll: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-7" style={{ border: "1px solid rgba(180, 145, 32, 0.16)" }}>
      <div className="mb-6 pb-4" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#2f2a1f", marginBottom: "6px" }}>Active Sessions</h2>
        <p style={{ fontSize: "14px", color: "#6f6653" }}>Monitor and manage user login sessions across devices</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search by IP, device, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input flex-1 min-w-48 px-3 py-2 rounded text-sm"
        />
        <button className="btn-secondary px-4 py-2 rounded text-sm" style={{ fontWeight: "600" }} onClick={onRefresh}>Refresh</button>
        <button className="btn-danger px-4 py-2 rounded text-sm" style={{ fontWeight: "600" }} onClick={onTerminateAll} disabled={allSessions.length === 0}>
          Terminate All Active
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="stat-card rounded p-3">
          <div style={{ fontSize: "12px", color: "#6f6653", fontWeight: "600" }}>Active Sessions</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#2f2a1f", marginTop: "4px" }}>{allSessions.length}</div>
          <div style={{ fontSize: "11px", color: "#6f6653", marginTop: "2px" }}>Live sessions that can be terminated remotely</div>
        </div>
        <div className="stat-card rounded p-3">
          <div style={{ fontSize: "12px", color: "#6f6653", fontWeight: "600" }}>Filtered Results</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#2f2a1f", marginTop: "4px" }}>{sessions.length}</div>
          <div style={{ fontSize: "11px", color: "#6f6653", marginTop: "2px" }}>Matching current search</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6f6653" }}>Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#6f6653" }}>
          <div style={{ fontSize: "16px", color: "#2f2a1f", fontWeight: "600", marginBottom: "8px" }}>No active sessions found</div>
          <div style={{ fontSize: "14px" }}>Try adjusting your search or check back later</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid rgba(180, 145, 32, 0.16)" }}>
          <table className="data-table w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["IP Address", "Device / Agent", "Location", "Started At", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-sm" style={{ color: "#2f2a1f", fontWeight: "700", borderBottom: "1px solid rgba(180, 145, 32, 0.22)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ background: "white" }}>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", color: "#6f6653", fontFamily: "monospace", fontSize: "13px" }}>{s.ip_address || "-"}</td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", color: "#6f6653", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.device || "-"}</td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", color: "#6f6653" }}>{s.location || "-"}</td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", color: "#6f6653", whiteSpace: "nowrap" }}>
                    {s.started_at ? new Date(s.started_at).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)" }}>
                    <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", background: s.is_active ? "rgba(46,158,91,0.10)" : "rgba(111,102,83,0.10)", color: s.is_active ? "#2e9e5b" : "#6f6653", border: `1px solid ${s.is_active ? "rgba(46,158,91,0.18)" : "rgba(111,102,83,0.18)"}` }}>
                      {s.is_active ? "Active" : "Ended"}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)" }}>
                    {s.is_active && (
                      <button className="btn-danger px-3 py-1 rounded text-xs" style={{ fontWeight: "600" }} onClick={() => onTerminate(s.id)}>
                        Terminate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ background: "#fff9e7", border: "1px solid rgba(244, 196, 48, 0.22)", borderRadius: "8px", padding: "16px", marginTop: "20px" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#2f2a1f", marginBottom: "4px" }}>Session Security</div>
        <div style={{ fontSize: "13px", color: "#6f6653", lineHeight: 1.5 }}>Regularly review active sessions for suspicious locations or devices. Terminate unknown sessions immediately.</div>
      </div>
    </div>
  );
}

function AccessLogTab({ entries, allEntries, search, setSearch, actionFilter, setActionFilter, pagination, currentPage, onPageChange, loading, onRefresh }: {
  entries: AccessLogEntry[];
  allEntries: AccessLogEntry[];
  search: string;
  setSearch: (v: string) => void;
  actionFilter: string;
  setActionFilter: (v: string) => void;
  pagination: Pagination;
  currentPage: number;
  onPageChange: (p: number) => void;
  loading: boolean;
  onRefresh: () => void;
}) {
  const actionColor: Record<string, { bg: string; color: string; border: string }> = {
    granted: { bg: "rgba(46, 158, 91, 0.10)", color: "#2e9e5b", border: "rgba(46, 158, 91, 0.18)" },
    revoked: { bg: "rgba(214, 69, 69, 0.10)", color: "#d64545", border: "rgba(214, 69, 69, 0.18)" },
    login: { bg: "rgba(244, 196, 48, 0.12)", color: "#b8860b", border: "rgba(244, 196, 48, 0.25)" },
    logout: { bg: "rgba(111, 102, 83, 0.10)", color: "#6f6653", border: "rgba(111, 102, 83, 0.18)" },
  };

  const getActionStyle = (action: string) =>
    actionColor[action.toLowerCase()] || { bg: "rgba(180, 145, 32, 0.10)", color: "#b8860b", border: "rgba(180, 145, 32, 0.22)" };

  const totalPages = pagination.totalPages || 1;

  const pageNumbers = (() => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 3);
    const end = Math.min(totalPages, currentPage + 3);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  })();

  return (
    <div className="bg-white rounded-lg shadow-md p-7" style={{ border: "1px solid rgba(180, 145, 32, 0.16)" }}>
      <div className="mb-6 pb-4" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#2f2a1f", marginBottom: "6px" }}>Access Log</h2>
        <p style={{ fontSize: "14px", color: "#6f6653" }}>Audit trail of privilege grants, revocations and user activity</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search by user, action, or item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input flex-1 min-w-48 px-3 py-2 rounded text-sm"
        />
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="form-input px-3 py-2 rounded text-sm" style={{ minWidth: "150px" }}>
          <option value="all">All Actions</option>
          <option value="granted">Granted</option>
          <option value="revoked">Revoked</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
        </select>
        <button className="btn-secondary px-4 py-2 rounded text-sm" style={{ fontWeight: "600" }} onClick={onRefresh}>Refresh</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="stat-card rounded p-3">
          <div style={{ fontSize: "12px", color: "#6f6653", fontWeight: "600" }}>Total Records</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#2f2a1f", marginTop: "4px" }}>{pagination.total || allEntries.length}</div>
          <div style={{ fontSize: "11px", color: "#6f6653", marginTop: "2px" }}>All log entries in database</div>
        </div>
        <div className="stat-card rounded p-3">
          <div style={{ fontSize: "12px", color: "#6f6653", fontWeight: "600" }}>Current Page</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#2f2a1f", marginTop: "4px" }}>{entries.length}</div>
          <div style={{ fontSize: "11px", color: "#6f6653", marginTop: "2px" }}>Page {currentPage} of {totalPages}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6f6653" }}>Loading access log...</div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#6f6653" }}>
          <div style={{ fontSize: "16px", color: "#2f2a1f", fontWeight: "600", marginBottom: "8px" }}>No log entries found</div>
          <div style={{ fontSize: "14px" }}>Try adjusting your search or action filter</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid rgba(180, 145, 32, 0.16)" }}>
          <table className="data-table w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["User", "Action", "Item / Resource", "Performed By", "Timestamp"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-sm" style={{ color: "#2f2a1f", fontWeight: "700", borderBottom: "1px solid rgba(180, 145, 32, 0.22)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const astyle = getActionStyle(e.action);
                return (
                  <tr key={e.id} style={{ background: "white" }}>
                    <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", fontWeight: "600", color: "#2f2a1f" }}>{e.user_name || e.userName || "-"}</td>
                    <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", background: astyle.bg, color: astyle.color, border: `1px solid ${astyle.border}` }}>
                        {e.action}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", color: "#6f6653" }}>{e.item || e.resource || "-"}</td>
                    <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", color: "#6f6653" }}>{e.performed_by_name || e.performedBy || "-"}</td>
                    <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", color: "#6f6653", whiteSpace: "nowrap" }}>
                      {(e.timestamp || e.created_at) ? new Date((e.timestamp || e.created_at)!).toLocaleString() : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px", flexWrap: "wrap" }}>
          <button className="page-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>Prev</button>
          {pageNumbers.map((p) => (
            <button key={p} className={`page-btn${p === currentPage ? " active-page" : ""}`} onClick={() => onPageChange(p)}>{p}</button>
          ))}
          <button className="page-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}