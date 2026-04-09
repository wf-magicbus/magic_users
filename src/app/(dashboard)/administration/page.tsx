"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";

const tabs = ["Admin Accounts", "Admin Roles", "Protected Groups"] as const;
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

function TableShell({ headers, children, empty }: { headers: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {headers.map(h => (
              <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty && <div className="py-12 text-center text-sm" style={{ color: "var(--text-3)" }}>No data found.</div>}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center gap-2 py-8 text-sm" style={{ color: "var(--text-3)" }}>
      <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--crimson)", borderTopColor: "transparent" }}/>
      Loading…
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-lg)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>{title}</h2>
            {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--silver-50)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full appearance-none px-3 pr-9 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text-1)" }}
          onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--crimson)"}
          onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"}>
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
          </svg>
        </span>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text-1)" }}
        onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--crimson)"}
        onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"}/>
    </div>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm" style={{ color: "var(--text-1)" }}>{label}</span>
      <button type="button" onClick={() => onChange(!value)}
        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
        style={{ background: value ? "var(--crimson)" : "var(--silver)" }}>
        <span className="inline-block rounded-full bg-white shadow-sm transition-transform"
          style={{ width: 14, height: 14, transform: value ? "translateX(18px)" : "translateX(2px)" }}/>
      </button>
    </div>
  );
}

function ModalActions({ onClose, saving, label }: { onClose: () => void; saving: boolean; label: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose}
        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border-strong)" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--silver-50)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}>
        Cancel
      </button>
      <button type="submit" disabled={saving}
        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
        style={{ background: "var(--crimson)", boxShadow: "0 4px 12px rgba(228,0,75,0.3)" }}
        onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = "var(--crimson-dark)"; }}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson)"}>
        {saving ? "Saving…" : label}
      </button>
    </div>
  );
}

// ─── Add Admin Modal ──────────────────────────────────────────────────────────
// Assigns an existing user to an admin account with a selected role
function AddAdminModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin-roles").then(r => r.json()),
      fetch("/api/users?limit=200").then(r => r.json()),
    ]).then(([roleData, userData]) => {
      const roleList = Array.isArray(roleData) ? roleData : [];
      const userList = Array.isArray(userData?.users) ? userData.users : [];
      setRoles(roleList);
      setUsers(userList);
      if (roleList.length > 0) setRoleId(roleList[0].id);
    }).catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredUsers = userSearch.trim()
    ? users.filter(u => (u.name ?? u.username ?? "").toLowerCase().includes(userSearch.toLowerCase()))
    : users;

  const handleUserSelect = (u: any) => {
    setSelectedUser(u);
    setUserSearch(u.name ?? u.username ?? "");
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !roleId) { setError("Please select a user and a role."); return; }
    setSaving(true); setError("");
    try {
      const uid = selectedUser.user_id ?? selectedUser.id;
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uid,
          name: selectedUser.name ?? selectedUser.username ?? "Unknown",
          email: selectedUser.email ?? `${uid}@internal`,
          role_id: roleId,
        }),
      });
      if (res.ok) { onSuccess(); onClose(); }
      else { const d = await res.json(); setError(d.error ?? "Failed to add admin."); }
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Add Admin Account" subtitle="Assign an existing user to an admin role" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Searchable user picker */}
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-3)" }}>User</label>
          <div ref={searchRef} className="relative">
            <div className="relative">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-3)" }}>
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input
                type="text"
                placeholder="Search users…"
                value={userSearch}
                onChange={e => { setUserSearch(e.target.value); setSelectedUser(null); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text-1)" }}
                onMouseDown={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--crimson)"}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = selectedUser ? "var(--crimson)" : "var(--border-strong)"}
              />
            </div>
            {showDropdown && filteredUsers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
                {filteredUsers.slice(0, 20).map(u => {
                  const uid = u.user_id ?? u.id;
                  return (
                    <button key={uid} type="button" onMouseDown={() => handleUserSelect(u)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors text-sm"
                      style={{ color: "var(--text-1)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "var(--crimson-50)", color: "var(--crimson)" }}>
                        {(u.name ?? u.username ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{u.name ?? u.username}</span>
                      {u.role && <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--sky-50)", color: "var(--sky-dark)" }}>{u.role.replace(/_/g, " ")}</span>}
                    </button>
                  );
                })}
                {filteredUsers.length > 20 && (
                  <div className="px-3 py-2 text-xs text-center" style={{ color: "var(--text-3)" }}>
                    Showing 20 of {filteredUsers.length} — type to narrow
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <SelectField label="Admin Role" value={roleId} onChange={setRoleId}>
          {roles.length === 0
            ? <option value="">Loading roles…</option>
            : roles.map(r => <option key={r.id} value={r.id}>{r.role_name.replace(/_/g, " ")}</option>)
          }
        </SelectField>

        {error && <div className="px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--crimson-50)", color: "var(--crimson)" }}>{error}</div>}
        <ModalActions onClose={onClose} saving={saving} label="Add Admin" />
      </form>
    </Modal>
  );
}

// ─── Add Role Modal ───────────────────────────────────────────────────────────
// Creates a new role definition — no email needed
function AddRoleModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ role_name: "", description: "", is_admin: false, is_dedicated_admin: false, max_members: "0" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role_name.trim()) { setError("Role name is required."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role_name: form.role_name,
          description: form.description,
          is_admin: form.is_admin,
          is_dedicated_admin: form.is_dedicated_admin,
          max_members: parseInt(form.max_members) || 0,
        }),
      });
      if (res.ok) { onSuccess(); onClose(); }
      else { const d = await res.json(); setError(d.error ?? "Failed to create role."); }
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Create Admin Role" subtitle="Define a new role — name is stored as snake_case" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="Role Name" placeholder="e.g. help desk" value={form.role_name}
          onChange={v => setForm(f => ({ ...f, role_name: v }))}/>
        <TextField label="Description" placeholder="What this role can do…" value={form.description}
          onChange={v => setForm(f => ({ ...f, description: v }))}/>
        <div className="rounded-xl px-3 py-2 space-y-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <ToggleField label="Admin privileges" value={form.is_admin} onChange={v => setForm(f => ({ ...f, is_admin: v }))}/>
          <ToggleField label="Dedicated admin account" value={form.is_dedicated_admin} onChange={v => setForm(f => ({ ...f, is_dedicated_admin: v }))}/>
        </div>
        <TextField label="Max Members (0 = unlimited)" placeholder="0" type="number" value={form.max_members}
          onChange={v => setForm(f => ({ ...f, max_members: v }))}/>
        {error && <div className="px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--crimson-50)", color: "var(--crimson)" }}>{error}</div>}
        <ModalActions onClose={onClose} saving={saving} label="Create Role" />
      </form>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdministrationPage() {
  const { loading } = useAuthGuard();
  const [activeTab, setActiveTab] = useState<Tab>("Admin Accounts");

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--crimson)", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium mb-1" style={{ color: "var(--crimson)" }}>Security</p>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Administration</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Manage admin accounts, roles, and protected groups</p>
      </div>
      <PillTabs active={activeTab} onChange={setActiveTab} />
      {activeTab === "Admin Accounts" && <AdminAccountsTab />}
      {activeTab === "Admin Roles" && <AdminRolesTab />}
      {activeTab === "Protected Groups" && <ProtectedGroupsTab />}
    </div>
  );
}

function AdminAccountsTab() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchAdmins = () => {
    setLoading(true);
    fetch("/api/admins").then(r => r.json()).then(d => setAdmins(d.admins ?? [])).catch(() => setAdmins([])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const allRoles = Array.from(new Set(admins.map(a => a.role).filter(Boolean)));

  const filtered = admins.filter(a => {
    const matchSearch = !search.trim() || (a.name ?? "").toLowerCase().includes(search.toLowerCase()) || (a.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || a.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) return <Spinner />;

  return (
    <div>
      {showModal && <AddAdminModal onClose={() => setShowModal(false)} onSuccess={fetchAdmins} />}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm" style={{ color: "var(--text-2)" }}>{filtered.length} account{filtered.length !== 1 ? "s" : ""}</span>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "var(--crimson)", boxShadow: "0 4px 12px rgba(228,0,75,0.3)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson-dark)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson)"}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
          Add Admin
        </button>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
        <div className="px-5 py-4 flex gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="relative flex-1">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-3)" }}>
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input type="text" placeholder="Search admins…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none transition-all"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text-1)" }}
              onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--crimson)"}
              onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"}/>
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text-1)" }}>
            <option value="all">All Roles</option>
            {allRoles.map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
          </select>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Admin", "Role", "Created", "Actions"].map(h => (
                <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
        {filtered.length === 0 ? (
          <tr><td colSpan={4} className="px-6 py-12 text-center text-sm" style={{ color: "var(--text-3)" }}>No admins found.</td></tr>
        ) : filtered.map((admin, i) => (
          <tr key={admin.id} className="transition-colors" style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "var(--gold-50)", color: "var(--gold-dark)" }}>
                  {admin.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{admin.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-3)" }}>{admin.email}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "var(--sky-50)", color: "var(--sky-dark)" }}>
                {admin.role?.replace(/_/g, " ")}
              </span>
            </td>
            <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>{new Date(admin.created_at).toLocaleDateString()}</td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: "var(--sky-50)", color: "var(--sky-dark)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--sky-100)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--sky-50)"}>Edit</button>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: "var(--crimson-50)", color: "var(--crimson)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson-100)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson-50)"}>Remove</button>
              </div>
            </td>
          </tr>
        ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminRolesTab() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchRoles = () => {
    setLoading(true);
    fetch("/api/admin-roles").then(r => r.json()).then(d => setRoles(Array.isArray(d) ? d : [])).catch(() => setRoles([])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRoles(); }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      {showModal && <AddRoleModal onClose={() => setShowModal(false)} onSuccess={fetchRoles} />}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm" style={{ color: "var(--text-2)" }}>{roles.length} role{roles.length !== 1 ? "s" : ""}</span>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "var(--crimson)", boxShadow: "0 4px 12px rgba(228,0,75,0.3)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson-dark)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson)"}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
          Add Role
        </button>
      </div>
      <TableShell headers={["Role", "Description", "Admin", "Dedicated", "Max Members"]} empty={roles.length === 0}>
        {roles.map((role, i) => (
          <tr key={role.id} className="transition-colors" style={{ borderBottom: i < roles.length - 1 ? "1px solid var(--border)" : "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
            <td className="px-6 py-4 text-sm font-semibold capitalize" style={{ color: "var(--text-1)" }}>{role.role_name.replace(/_/g, " ")}</td>
            <td className="px-6 py-4 text-sm max-w-xs" style={{ color: "var(--text-2)" }}>{role.description ?? "—"}</td>
            <td className="px-6 py-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={role.is_admin ? { background: "#F0FDF4", color: "#15803D" } : { background: "var(--silver-50)", color: "var(--text-3)" }}>
                {role.is_admin ? "Yes" : "No"}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={role.is_dedicated_admin ? { background: "var(--sky-50)", color: "var(--sky-dark)" } : { background: "var(--silver-50)", color: "var(--text-3)" }}>
                {role.is_dedicated_admin ? "Yes" : "No"}
              </span>
            </td>
            <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>{role.max_members === 0 ? "Unlimited" : role.max_members}</td>
          </tr>
        ))}
      </TableShell>
    </div>
  );
}

function ProtectedGroupsTab() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/protected-groups").then(r => r.json()).then(d => setGroups(Array.isArray(d) ? d : [])).catch(() => setGroups([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <TableShell headers={["Group", "Description"]} empty={groups.length === 0}>
      {groups.map((group, i) => (
        <tr key={group.id} className="transition-colors" style={{ borderBottom: i < groups.length - 1 ? "1px solid var(--border)" : "none" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--gold-50)", color: "var(--gold-dark)" }}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{group.group_name}</span>
            </div>
          </td>
          <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>{group.description ?? "—"}</td>
        </tr>
      ))}
    </TableShell>
  );
}
