"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";

const tabs = ["Nodes", "Users", "Pre-Auth Keys", "Routes"] as const;
type Tab = typeof tabs[number];

function PillTabs({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl w-fit mb-6" style={{ background: "var(--silver-100)" }}>
      {tabs.map(tab => (
        <button key={tab} onClick={() => onChange(tab)}
          className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
          style={{
            background: active === tab ? "var(--surface)" : "transparent",
            color: active === tab ? "var(--crimson)" : "var(--text-2)",
            boxShadow: active === tab ? "var(--shadow-sm)" : "none",
          }}>
          {tab}
        </button>
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center gap-2 py-8 text-sm" style={{ color: "var(--text-3)" }}>
      <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--crimson)", borderTopColor: "transparent" }} />
      Loading…
    </div>
  );
}

function TableShell({ headers, children, empty, action }: { headers: string[]; children: React.ReactNode; empty?: boolean; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
      {action && <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>{action}</div>}
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {headers.map(h => <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty && <div className="py-12 text-center text-sm" style={{ color: "var(--text-3)" }}>No data found.</div>}
    </div>
  );
}

function StatusDot({ online }: { online: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={online
        ? { background: "#F0FDF4", color: "#15803D" }
        : { background: "var(--silver-50)", color: "var(--text-3)" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: online ? "#22C55E" : "var(--silver)" }} />
      {online ? "Online" : "Offline"}
    </span>
  );
}

function CrimsonBtn({ onClick, children, small }: { onClick: () => void; children: React.ReactNode; small?: boolean }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-semibold text-white rounded-xl transition-all ${small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}`}
      style={{ background: "var(--crimson)", boxShadow: small ? "none" : "0 4px 12px rgba(228,0,75,0.25)" }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson-dark)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson)"}>
      {children}
    </button>
  );
}

function DangerBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
      style={{ background: "var(--crimson-50)", color: "var(--crimson)" }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson-100)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson-50)"}>
      {children}
    </button>
  );
}

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
      onClick={e => { if (e.target === ref.current) onClose(); }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-lg)" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Nodes ────────────────────────────────────────────────────────────────────
function NodesTab() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetch_ = () => {
    setLoading(true);
    fetch("/api/headscale/nodes").then(r => r.json())
      .then(d => setNodes(d.nodes ?? []))
      .catch(() => setNodes([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch_(); }, []);

  const expire = async (id: string) => {
    await fetch(`/api/headscale/nodes/${id}?action=expire`, { method: "POST" });
    fetch_();
  };
  const remove = async (id: string) => {
    if (!confirm("Remove this node from the network?")) return;
    await fetch(`/api/headscale/nodes/${id}`, { method: "DELETE" });
    fetch_();
  };

  const filtered = search.trim()
    ? nodes.filter(n => n.name?.toLowerCase().includes(search.toLowerCase()) || n.ipAddresses?.some((ip: string) => ip.includes(search)))
    : nodes;

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm" style={{ color: "var(--text-2)" }}>{filtered.length} node{filtered.length !== 1 ? "s" : ""}</span>
        <button onClick={fetch_} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: "var(--sky-50)", color: "var(--sky-dark)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--sky-100)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--sky-50)"}>
          Refresh
        </button>
      </div>
      <TableShell
        headers={["Node", "IP Addresses", "User", "Last Seen", "Status", "Actions"]}
        empty={filtered.length === 0}
        action={
          <div className="relative w-72">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-3)" }}>
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input type="text" placeholder="Search nodes…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none transition-all"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text-1)" }}
              onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--crimson)"}
              onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"}/>
          </div>
        }>
        {filtered.map((node, i) => {
          const online = node.online ?? false;
          const lastSeen = node.lastSeen ? new Date(node.lastSeen) : null;
          return (
            <tr key={node.id} className="transition-colors" style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: online ? "#F0FDF4" : "var(--silver-50)" }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: online ? "#15803D" : "var(--silver)" }}>
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{node.name}</div>
                    <div className="text-xs font-mono" style={{ color: "var(--text-3)" }}>{node.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-0.5">
                  {(node.ipAddresses ?? []).map((ip: string) => (
                    <div key={ip} className="text-xs font-mono px-2 py-0.5 rounded w-fit" style={{ background: "var(--sky-50)", color: "var(--sky-dark)" }}>{ip}</div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>{node.user?.name ?? "—"}</td>
              <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>
                {lastSeen ? lastSeen.toLocaleString() : "—"}
              </td>
              <td className="px-6 py-4"><StatusDot online={online} /></td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button onClick={() => expire(node.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: "var(--gold-50)", color: "var(--gold-dark)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--gold-100)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--gold-50)"}>
                    Expire
                  </button>
                  <DangerBtn onClick={() => remove(node.id)}>Remove</DangerBtn>
                </div>
              </td>
            </tr>
          );
        })}
      </TableShell>
    </div>
  );
}

// ─── Users ────────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetch_ = () => {
    setLoading(true);
    fetch("/api/headscale/users").then(r => r.json())
      .then(d => setUsers(d.users ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch_(); }, []);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/headscale/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName }) });
      if (res.ok) { fetch_(); setShowAdd(false); setNewName(""); }
      else { const d = await res.json(); setError(d.error?.message ?? "Failed"); }
    } finally { setSaving(false); }
  };

  const deleteUser = async (name: string) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    await fetch("/api/headscale/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    fetch_();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {showAdd && (
        <ModalOverlay onClose={() => setShowAdd(false)}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>Create Headscale User</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>Username used for issuing pre-auth keys</p>
          </div>
          <form onSubmit={addUser} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Username</label>
              <input type="text" placeholder="e.g. alice" value={newName} onChange={e => setNewName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text-1)" }}
                onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--crimson)"}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"}
                autoFocus/>
            </div>
            {error && <div className="text-sm px-3 py-2 rounded-xl" style={{ background: "var(--crimson-50)", color: "var(--crimson)" }}>{error}</div>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border-strong)" }}>Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--crimson)" }}>{saving ? "Creating…" : "Create"}</button>
            </div>
          </form>
        </ModalOverlay>
      )}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm" style={{ color: "var(--text-2)" }}>{users.length} user{users.length !== 1 ? "s" : ""}</span>
        <CrimsonBtn onClick={() => setShowAdd(true)}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
          Add User
        </CrimsonBtn>
      </div>
      <TableShell headers={["Username", "Created", "Actions"]} empty={users.length === 0}>
        {users.map((user, i) => (
          <tr key={user.id} className="transition-colors" style={{ borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: "var(--sky-50)", color: "var(--sky-dark)" }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{user.name}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
            <td className="px-6 py-4"><DangerBtn onClick={() => deleteUser(user.name)}>Delete</DangerBtn></td>
          </tr>
        ))}
      </TableShell>
    </div>
  );
}

// ─── Pre-Auth Keys ────────────────────────────────────────────────────────────
function PreAuthKeysTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ reusable: false, ephemeral: false, expiry: "" });
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    fetch("/api/headscale/users").then(r => r.json()).then(d => {
      const list = d.users ?? [];
      setUsers(list);
      if (list.length > 0) setSelectedUser(list[0].name);
    });
  }, []);

  const fetchKeys = (user: string) => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/headscale/preauthkeys?user=${encodeURIComponent(user)}`).then(r => r.json())
      .then(d => setKeys(d.preAuthKeys ?? []))
      .catch(() => setKeys([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (selectedUser) fetchKeys(selectedUser); }, [selectedUser]);

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body: any = { user: selectedUser, reusable: form.reusable, ephemeral: form.ephemeral };
    if (form.expiry) body.expiration = new Date(form.expiry).toISOString();
    const res = await fetch("/api/headscale/preauthkeys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { setNewKey(data.preAuthKey?.key ?? ""); fetchKeys(selectedUser); }
  };

  const expireKey = async (key: string) => {
    await fetch("/api/headscale/preauthkeys", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user: selectedUser, key }) });
    fetchKeys(selectedUser);
  };

  return (
    <div>
      {showCreate && (
        <ModalOverlay onClose={() => { setShowCreate(false); setNewKey(""); }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>Create Pre-Auth Key</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>For user: <strong>{selectedUser}</strong></p>
          </div>
          <div className="px-6 py-5">
            {newKey ? (
              <div className="space-y-4">
                <div className="rounded-xl p-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-3)" }}>KEY — copy now, it won't be shown again</p>
                  <code className="text-xs font-mono break-all" style={{ color: "var(--crimson)" }}>{newKey}</code>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(newKey); }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--crimson)" }}>
                  Copy Key
                </button>
                <button onClick={() => { setShowCreate(false); setNewKey(""); }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border-strong)" }}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={createKey} className="space-y-4">
                <div className="space-y-3 rounded-xl px-3 py-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  {[["reusable", "Reusable"], ["ephemeral", "Ephemeral (node deleted when offline)"]].map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: "var(--text-1)" }}>{label}</span>
                      <button type="button" onClick={() => setForm(f => ({ ...f, [key]: !(f as any)[key] }))}
                        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                        style={{ background: (form as any)[key] ? "var(--crimson)" : "var(--silver)" }}>
                        <span className="inline-block rounded-full bg-white shadow-sm transition-transform"
                          style={{ width: 14, height: 14, transform: (form as any)[key] ? "translateX(18px)" : "translateX(2px)" }}/>
                      </button>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Expiry (optional)</label>
                  <input type="datetime-local" value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text-1)" }}/>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border-strong)" }}>Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--crimson)" }}>{saving ? "Creating…" : "Create"}</button>
                </div>
              </form>
            )}
          </div>
        </ModalOverlay>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>User</span>
          <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text-1)" }}>
            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
        <CrimsonBtn onClick={() => setShowCreate(true)}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
          Create Key
        </CrimsonBtn>
      </div>

      {loading ? <Spinner /> : (
        <TableShell headers={["Key", "Reusable", "Ephemeral", "Used", "Expires", "Actions"]} empty={keys.length === 0}>
          {keys.map((k, i) => (
            <tr key={k.key} className="transition-colors" style={{ borderBottom: i < keys.length - 1 ? "1px solid var(--border)" : "none" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
              <td className="px-6 py-4">
                <code className="text-xs font-mono" style={{ color: k.used ? "var(--text-3)" : "var(--crimson)" }}>
                  {k.key?.slice(0, 20)}…
                </code>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={k.reusable ? { background: "var(--sky-50)", color: "var(--sky-dark)" } : { background: "var(--silver-50)", color: "var(--text-3)" }}>
                  {k.reusable ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={k.ephemeral ? { background: "var(--gold-50)", color: "var(--gold-dark)" } : { background: "var(--silver-50)", color: "var(--text-3)" }}>
                  {k.ephemeral ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>{k.used ? "Yes" : "No"}</td>
              <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>
                {k.expiration && k.expiration !== "0001-01-01T00:00:00Z" ? new Date(k.expiration).toLocaleDateString() : "Never"}
              </td>
              <td className="px-6 py-4">
                {!k.used && <DangerBtn onClick={() => expireKey(k.key)}>Expire</DangerBtn>}
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────
function RoutesTab() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = () => {
    setLoading(true);
    fetch("/api/headscale/routes").then(r => r.json())
      .then(d => setRoutes(d.routes ?? []))
      .catch(() => setRoutes([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch_(); }, []);

  const toggleRoute = async (id: string, enabled: boolean) => {
    await fetch(`/api/headscale/routes?id=${id}&action=${enabled ? "disable" : "enable"}`, { method: "POST" });
    fetch_();
  };
  const deleteRoute = async (id: string) => {
    if (!confirm("Delete this route?")) return;
    await fetch(`/api/headscale/routes?id=${id}&action=delete`, { method: "POST" });
    fetch_();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={fetch_} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: "var(--sky-50)", color: "var(--sky-dark)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--sky-100)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--sky-50)"}>
          Refresh
        </button>
      </div>
      <TableShell headers={["Prefix", "Node", "Advertised", "Enabled", "Primary", "Actions"]} empty={routes.length === 0}>
        {routes.map((route, i) => (
          <tr key={route.id} className="transition-colors" style={{ borderBottom: i < routes.length - 1 ? "1px solid var(--border)" : "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
            <td className="px-6 py-4">
              <code className="text-xs font-mono px-2 py-1 rounded" style={{ background: "var(--sky-50)", color: "var(--sky-dark)" }}>{route.prefix}</code>
            </td>
            <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>{route.node?.name ?? "—"}</td>
            <td className="px-6 py-4">
              <span className="text-xs font-semibold" style={{ color: route.advertised ? "#15803D" : "var(--text-3)" }}>{route.advertised ? "Yes" : "No"}</span>
            </td>
            <td className="px-6 py-4">
              <button onClick={() => toggleRoute(route.id, route.enabled)}
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                style={{ background: route.enabled ? "var(--crimson)" : "var(--silver)" }}>
                <span className="inline-block rounded-full bg-white shadow-sm transition-transform"
                  style={{ width: 14, height: 14, transform: route.enabled ? "translateX(18px)" : "translateX(2px)" }}/>
              </button>
            </td>
            <td className="px-6 py-4">
              <span className="text-xs font-semibold" style={{ color: route.isPrimary ? "var(--sky-dark)" : "var(--text-3)" }}>{route.isPrimary ? "Yes" : "No"}</span>
            </td>
            <td className="px-6 py-4"><DangerBtn onClick={() => deleteRoute(route.id)}>Delete</DangerBtn></td>
          </tr>
        ))}
      </TableShell>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NetworkPage() {
  const { loading } = useAuthGuard();
  const [activeTab, setActiveTab] = useState<Tab>("Nodes");

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--crimson)", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium mb-1" style={{ color: "var(--crimson)" }}>Infrastructure</p>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Network</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Headscale VPN — <span className="font-mono text-xs" style={{ color: "var(--text-3)" }}>65.1.54.28:8080</span>
        </p>
      </div>
      <PillTabs active={activeTab} onChange={setActiveTab} />
      {activeTab === "Nodes" && <NodesTab />}
      {activeTab === "Users" && <UsersTab />}
      {activeTab === "Pre-Auth Keys" && <PreAuthKeysTab />}
      {activeTab === "Routes" && <RoutesTab />}
    </div>
  );
}
