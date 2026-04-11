"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";

// ─── Constants ───────────────────────────────────────────────────────────────

const POLICY_LABELS: Record<string, string> = {
  password_policy: "Password Policy",
  lockout_policy: "Lockout Policy",
  url_filter_rules: "URL Filtering",
  endpoint_protection: "Endpoint Protection",
  firewall_policy: "Firewall Policy",
  hardening_policy: "Hardening",
  logon_restrictions: "Logon Restrictions",
  removable_storage_policy: "Removable Storage",
};

const POLICY_ICONS: Record<string, string> = {
  password_policy: "🔑",
  lockout_policy: "🔒",
  url_filter_rules: "🌐",
  endpoint_protection: "🛡️",
  firewall_policy: "🔥",
  hardening_policy: "⚙️",
  logon_restrictions: "🚪",
  removable_storage_policy: "💾",
};

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = { name: string; policies: Record<string, boolean> };
type PanelState = { role: string; policy: string; isNew: boolean; values: Record<string, unknown> } | null;

// ─── Form field helpers ───────────────────────────────────────────────────────

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm" style={{ color: "#c9d1d9" }}>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className="relative inline-flex items-center w-10 h-5 rounded-full transition-colors flex-shrink-0"
        style={{ background: checked ? "#E4004B" : "#30363d" }}
      >
        <span
          className="absolute w-4 h-4 bg-white rounded-full shadow transition-transform"
          style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <label className="block text-xs font-medium mb-1.5" style={{ color: "#8b949e" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", min, max }: {
  value: string | number; onChange: (v: string | number) => void;
  type?: string; min?: number; max?: number;
}) {
  return (
    <input
      type={type}
      value={value as string}
      min={min}
      max={max}
      onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
      style={{ background: "#0d1117", border: "1px solid #30363d", color: "#e6edf3" }}
    />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
      style={{ background: "#0d1117", border: "1px solid #30363d", color: "#e6edf3" }}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─── Policy-specific forms ────────────────────────────────────────────────────

function PolicyForm({ policy, values, onChange }: {
  policy: string;
  values: Record<string, unknown>;
  onChange: (key: string, val: unknown) => void;
}) {
  const v = values;
  const b = (k: string, def = true) => (v[k] === undefined ? def : Boolean(v[k]));
  const n = (k: string, def: number) => (v[k] === undefined ? def : Number(v[k]));
  const s = (k: string, def: string) => (v[k] === undefined ? def : String(v[k]));

  if (policy === "password_policy") return (
    <div>
      <Field label="Minimum Password Length">
        <Input type="number" value={n("min_password_length", 8)} min={4} max={128} onChange={(val) => onChange("min_password_length", val)} />
      </Field>
      <Field label="Max Password Age (days)">
        <Input type="number" value={n("max_password_age_days", 90)} min={0} onChange={(val) => onChange("max_password_age_days", val)} />
      </Field>
      <Field label="Min Password Age (days)">
        <Input type="number" value={n("min_password_age_days", 1)} min={0} onChange={(val) => onChange("min_password_age_days", val)} />
      </Field>
      <Field label="Password History Depth">
        <Input type="number" value={n("password_history_depth", 5)} min={0} max={50} onChange={(val) => onChange("password_history_depth", val)} />
      </Field>
      <div className="mt-2" style={{ borderTop: "1px solid #21262d", paddingTop: 8 }}>
        <Toggle label="Require Uppercase" checked={b("require_uppercase")} onChange={(val) => onChange("require_uppercase", val)} />
        <Toggle label="Require Lowercase" checked={b("require_lowercase")} onChange={(val) => onChange("require_lowercase", val)} />
        <Toggle label="Require Digit" checked={b("require_digit")} onChange={(val) => onChange("require_digit", val)} />
        <Toggle label="Require Special Character" checked={b("require_special_char")} onChange={(val) => onChange("require_special_char", val)} />
      </div>
    </div>
  );

  if (policy === "lockout_policy") return (
    <div>
      <Field label="Lockout Threshold (attempts)">
        <Input type="number" value={n("lockout_threshold_attempts", 5)} min={1} max={100} onChange={(val) => onChange("lockout_threshold_attempts", val)} />
      </Field>
      <Field label="Lockout Duration (minutes)">
        <Input type="number" value={n("lockout_duration_minutes", 30)} min={0} onChange={(val) => onChange("lockout_duration_minutes", val)} />
      </Field>
      <Field label="Observation Window (minutes)">
        <Input type="number" value={n("observation_window_minutes", 30)} min={1} onChange={(val) => onChange("observation_window_minutes", val)} />
      </Field>
    </div>
  );

  if (policy === "url_filter_rules") return (
    <div>
      <Field label="Rule Type">
        <Select value={s("rule_type", "blocked_url")} onChange={(val) => onChange("rule_type", val)} options={[
          { label: "Block URL", value: "blocked_url" },
          { label: "Allow URL", value: "allowed_url" },
          { label: "Block Category", value: "blocked_category" },
          { label: "Allow Category", value: "allowed_category" },
        ]} />
      </Field>
      <Field label="URL / Pattern">
        <Input value={s("value", "")} onChange={(val) => onChange("value", val)} />
      </Field>
      <Field label="Target Browser">
        <Select value={s("target_browser", "all")} onChange={(val) => onChange("target_browser", val)} options={[
          { label: "All Browsers", value: "all" },
          { label: "Chrome", value: "chrome" },
          { label: "Edge", value: "edge" },
        ]} />
      </Field>
      <Field label="Description">
        <Input value={s("description", "")} onChange={(val) => onChange("description", val)} />
      </Field>
      <Toggle label="Active" checked={b("is_active", true)} onChange={(val) => onChange("is_active", val)} />
    </div>
  );

  if (policy === "endpoint_protection") return (
    <div>
      <Toggle label="Windows Defender Enabled" checked={b("defender_enabled")} onChange={(val) => onChange("defender_enabled", val)} />
      <Toggle label="Real-time Protection" checked={b("realtime_protection_enabled")} onChange={(val) => onChange("realtime_protection_enabled", val)} />
      <Toggle label="Cloud Protection" checked={b("cloud_protection_enabled")} onChange={(val) => onChange("cloud_protection_enabled", val)} />
      <Toggle label="Scan Removable Drives" checked={b("scan_removable_drives")} onChange={(val) => onChange("scan_removable_drives", val)} />
      <Toggle label="Automatic Sample Submission" checked={b("automatic_sample_submission", false)} onChange={(val) => onChange("automatic_sample_submission", val)} />
      <Field label="Scheduled Scan Type">
        <Select value={s("scheduled_scan_type", "quick")} onChange={(val) => onChange("scheduled_scan_type", val)} options={[
          { label: "Disabled", value: "disabled" },
          { label: "Quick Scan", value: "quick" },
          { label: "Full Scan", value: "full" },
        ]} />
      </Field>
      <Field label="Scheduled Scan Day">
        <Select value={s("scheduled_scan_day", "everyday")} onChange={(val) => onChange("scheduled_scan_day", val)} options={[
          { label: "Every Day", value: "everyday" },
          ...["sunday","monday","tuesday","wednesday","thursday","friday","saturday"].map(d => ({ label: d.charAt(0).toUpperCase()+d.slice(1), value: d }))
        ]} />
      </Field>
    </div>
  );

  if (policy === "firewall_policy") return (
    <div>
      <Field label="Network Profile">
        <Select value={s("profile", "domain")} onChange={(val) => onChange("profile", val)} options={[
          { label: "Domain", value: "domain" },
          { label: "Private", value: "private" },
          { label: "Public", value: "public" },
        ]} />
      </Field>
      <Toggle label="Firewall Enabled" checked={b("firewall_enabled")} onChange={(val) => onChange("firewall_enabled", val)} />
      <Field label="Default Inbound Action">
        <Select value={s("default_inbound_action", "block")} onChange={(val) => onChange("default_inbound_action", val)} options={[
          { label: "Block", value: "block" },
          { label: "Allow", value: "allow" },
        ]} />
      </Field>
      <Field label="Default Outbound Action">
        <Select value={s("default_outbound_action", "allow")} onChange={(val) => onChange("default_outbound_action", val)} options={[
          { label: "Allow", value: "allow" },
          { label: "Block", value: "block" },
        ]} />
      </Field>
      <Toggle label="Log Dropped Packets" checked={b("log_dropped_packets")} onChange={(val) => onChange("log_dropped_packets", val)} />
      <Toggle label="Log Successful Connections" checked={b("log_successful_connections", false)} onChange={(val) => onChange("log_successful_connections", val)} />
      <Toggle label="Allow Local Firewall Rules" checked={b("allow_local_firewall_rules", false)} onChange={(val) => onChange("allow_local_firewall_rules", val)} />
      <Field label="Log Max Size (KB)">
        <Input type="number" value={n("log_max_size_kb", 4096)} min={1} onChange={(val) => onChange("log_max_size_kb", val)} />
      </Field>
    </div>
  );

  if (policy === "hardening_policy") return (
    <div>
      <Field label="Local Admin Action">
        <Select value={s("local_admin_action", "rename")} onChange={(val) => onChange("local_admin_action", val)} options={[
          { label: "Rename", value: "rename" },
          { label: "Remove", value: "remove" },
          { label: "Keep", value: "keep" },
        ]} />
      </Field>
      {s("local_admin_action", "rename") === "rename" && (
        <Field label="New Admin Name">
          <Input value={s("local_admin_new_name", "BuiltInAdmin")} onChange={(val) => onChange("local_admin_new_name", val)} />
        </Field>
      )}
      <div className="mt-3" style={{ borderTop: "1px solid #21262d", paddingTop: 8 }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#8b949e" }}>LAPS</p>
        <Toggle label="LAPS Enabled" checked={b("laps_enabled")} onChange={(val) => onChange("laps_enabled", val)} />
        <Field label="Password Length"><Input type="number" value={n("laps_password_length", 20)} min={8} max={64} onChange={(val) => onChange("laps_password_length", val)} /></Field>
        <Field label="Password Age (days)"><Input type="number" value={n("laps_password_age_days", 30)} min={1} onChange={(val) => onChange("laps_password_age_days", val)} /></Field>
      </div>
      <div className="mt-3" style={{ borderTop: "1px solid #21262d", paddingTop: 8 }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#8b949e" }}>UAC</p>
        <Toggle label="UAC Enabled" checked={b("uac_enabled")} onChange={(val) => onChange("uac_enabled", val)} />
        <Field label="UAC Level">
          <Select value={s("uac_level", "always_notify")} onChange={(val) => onChange("uac_level", val)} options={[
            { label: "Always Notify", value: "always_notify" },
            { label: "Notify on Changes", value: "notify_changes" },
            { label: "Notify (No Dim)", value: "notify_no_dim" },
            { label: "Never", value: "never" },
          ]} />
        </Field>
      </div>
      <div className="mt-3" style={{ borderTop: "1px solid #21262d", paddingTop: 8 }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#8b949e" }}>PowerShell & BitLocker</p>
        <Toggle label="PS Logging Enabled" checked={b("powershell_logging_enabled")} onChange={(val) => onChange("powershell_logging_enabled", val)} />
        <Toggle label="PS Script Block Logging" checked={b("powershell_script_block_logging")} onChange={(val) => onChange("powershell_script_block_logging", val)} />
        <Toggle label="BitLocker Enabled" checked={b("bitlocker_enabled")} onChange={(val) => onChange("bitlocker_enabled", val)} />
        <Field label="Encryption Method">
          <Select value={s("bitlocker_encryption_method", "xts_aes_256")} onChange={(val) => onChange("bitlocker_encryption_method", val)} options={[
            { label: "AES-128", value: "aes_128" },
            { label: "AES-256", value: "aes_256" },
            { label: "XTS-AES-128", value: "xts_aes_128" },
            { label: "XTS-AES-256", value: "xts_aes_256" },
          ]} />
        </Field>
      </div>
    </div>
  );

  if (policy === "logon_restrictions") return (
    <div>
      <Toggle label="Admin Local Logon Only" checked={b("admin_local_logon_only")} onChange={(val) => onChange("admin_local_logon_only", val)} />
      <Toggle label="RDP Admin Only" checked={b("rdp_admin_only")} onChange={(val) => onChange("rdp_admin_only", val)} />
      <Toggle label="Deny Service Account Local Logon" checked={b("deny_service_account_local_logon")} onChange={(val) => onChange("deny_service_account_local_logon", val)} />
      <Toggle label="Deny Interactive Service Logon" checked={b("deny_interactive_service_logon", false)} onChange={(val) => onChange("deny_interactive_service_logon", val)} />
    </div>
  );

  if (policy === "removable_storage_policy") return (
    <div>
      <Toggle label="Deny All Access (Master Switch)" checked={b("deny_all_access")} onChange={(val) => onChange("deny_all_access", val)} />
      <div className="mt-3" style={{ borderTop: "1px solid #21262d", paddingTop: 8 }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#8b949e" }}>USB / Removable Disk</p>
        <Toggle label="Deny Read" checked={b("removable_disk_deny_read")} onChange={(val) => onChange("removable_disk_deny_read", val)} />
        <Toggle label="Deny Write" checked={b("removable_disk_deny_write")} onChange={(val) => onChange("removable_disk_deny_write", val)} />
        <Toggle label="Deny Execute" checked={b("removable_disk_deny_execute")} onChange={(val) => onChange("removable_disk_deny_execute", val)} />
      </div>
      <div className="mt-3" style={{ borderTop: "1px solid #21262d", paddingTop: 8 }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#8b949e" }}>CD / DVD</p>
        <Toggle label="Deny Read" checked={b("cd_dvd_deny_read", false)} onChange={(val) => onChange("cd_dvd_deny_read", val)} />
        <Toggle label="Deny Write" checked={b("cd_dvd_deny_write")} onChange={(val) => onChange("cd_dvd_deny_write", val)} />
      </div>
      <div className="mt-3" style={{ borderTop: "1px solid #21262d", paddingTop: 8 }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#8b949e" }}>WPD (Phones / Cameras)</p>
        <Toggle label="Deny Read" checked={b("wpd_device_deny_read", false)} onChange={(val) => onChange("wpd_device_deny_read", val)} />
        <Toggle label="Deny Write" checked={b("wpd_device_deny_write")} onChange={(val) => onChange("wpd_device_deny_write", val)} />
      </div>
    </div>
  );

  return <p style={{ color: "#8b949e" }} className="text-sm">No configuration form available for this policy.</p>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const { loading: authLoading } = useAuthGuard();
  const [roles, setRoles] = useState<Role[]>([]);
  const [policyTables, setPolicyTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newRole, setNewRole] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState<PanelState>(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const fetchRoles = async () => {
    setLoading(true);
    const res = await fetch("/api/roles");
    const data = await res.json();
    setRoles(data.roles ?? []);
    setPolicyTables(data.policyTables ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); }, []);

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const openPanel = async (role: Role, policy: string) => {
    const isNew = !role.policies[policy];
    setPanelLoading(true);
    setPanel({ role: role.name, policy, isNew, values: {} });
    setSaveError("");

    if (!isNew) {
      const res = await fetch(`/api/roles/policy?role=${encodeURIComponent(role.name)}&table=${encodeURIComponent(policy)}`);
      const data = await res.json();
      const existing = data.data?.[0] ?? {};
      setPanel({ role: role.name, policy, isNew, values: existing });
    }
    setPanelLoading(false);
  };

  const updatePanelValue = (key: string, val: unknown) => {
    setPanel((p) => p ? { ...p, values: { ...p.values, [key]: val } } : p);
  };

  const savePanel = async () => {
    if (!panel) return;
    setSaving(true);
    setSaveError("");
    const res = await fetch("/api/roles/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: panel.role, policy_table: panel.policy, enabled: true, values: panel.values }),
    });
    if (!res.ok) {
      const d = await res.json();
      setSaveError(d.error ?? "Failed to save");
    } else {
      setPanel(null);
      await fetchRoles();
    }
    setSaving(false);
  };

  const removePolicy = async () => {
    if (!panel) return;
    if (!confirm(`Remove ${POLICY_LABELS[panel.policy]} from role "${panel.role}"?`)) return;
    setSaving(true);
    await fetch("/api/roles/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: panel.role, policy_table: panel.policy, enabled: false }),
    });
    setPanel(null);
    await fetchRoles();
    setSaving(false);
  };

  const createRole = async () => {
    if (!newRole.trim()) return;
    setCreating(true);
    setError("");
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRole }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to create role");
    } else {
      setNewRole("");
      await fetchRoles();
    }
    setCreating(false);
  };

  const deleteRole = async (name: string) => {
    if (!confirm(`Delete role "${name}"? This removes all associated policies.`)) return;
    await fetch("/api/roles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await fetchRoles();
  };

  if (authLoading) return null;

  return (
    <div className="flex-1 flex min-h-screen" style={{ background: "#0d1117" }}>
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-8 pt-8 pb-5" style={{ borderBottom: "1px solid #21262d" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Roles & Policy Matrix</h1>
              <p className="text-sm mt-1" style={{ color: "#8b949e" }}>
                Click a cell to configure that policy for the role
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createRole()}
                placeholder="New role name…"
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "#161b22", border: "1px solid #30363d", color: "#e6edf3", width: 180 }}
              />
              <button
                onClick={createRole}
                disabled={creating || !newRole.trim()}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "#E4004B", opacity: creating || !newRole.trim() ? 0.5 : 1 }}
              >
                {creating ? "Creating…" : "+ Add Role"}
              </button>
            </div>
          </div>
          {error && <p className="mt-2 text-sm" style={{ color: "#ff7b72" }}>{error}</p>}

          {/* Search */}
          <div className="mt-4 flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 20 20" fill="#8b949e">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search roles…"
                className="pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "#161b22", border: "1px solid #30363d", color: "#e6edf3", width: 220 }}
              />
            </div>
            {search && (
              <button onClick={() => setSearch("")} className="text-xs" style={{ color: "#8b949e" }}>
                Clear
              </button>
            )}
            <span className="text-xs ml-2" style={{ color: "#8b949e" }}>
              {filteredRoles.length} of {roles.length} roles shown
            </span>
          </div>
        </div>

        {/* Matrix */}
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-sm" style={{ color: "#8b949e" }}>Loading…</div>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="text-4xl">👥</div>
              <div className="text-sm" style={{ color: "#8b949e" }}>
                {roles.length === 0 ? "No roles yet. Create one above." : "No roles match your search."}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "separate", borderSpacing: 0, minWidth: "100%" }}>
                <thead>
                  <tr>
                    <th
                      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest"
                      style={{
                        color: "#8b949e",
                        background: "#161b22",
                        border: "1px solid #30363d",
                        borderRight: "none",
                        borderRadius: "10px 0 0 0",
                        minWidth: 200,
                        position: "sticky",
                        left: 0,
                        zIndex: 2,
                      }}
                    >
                      Policy
                    </th>
                    {filteredRoles.map((role, i) => (
                      <th
                        key={role.name}
                        style={{
                          background: "#161b22",
                          border: "1px solid #30363d",
                          borderLeft: "none",
                          borderRadius: i === filteredRoles.length - 1 ? "0 10px 0 0" : 0,
                          minWidth: 130,
                          padding: "12px 16px",
                        }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: "#E4004B" }}
                          >
                            {role.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-white capitalize text-center">
                            {role.name.replace(/_/g, " ")}
                          </span>
                          <button
                            onClick={() => deleteRole(role.name)}
                            className="text-[10px] px-2 py-0.5 rounded"
                            style={{ color: "#8b949e", background: "rgba(255,255,255,0.04)" }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.color = "#ff7b72";
                              (e.currentTarget as HTMLElement).style.background = "rgba(255,123,114,0.1)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.color = "#8b949e";
                              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {policyTables.map((policy, pIdx) => (
                    <tr key={policy}>
                      <td
                        style={{
                          background: "#161b22",
                          border: "1px solid #30363d",
                          borderTop: "none",
                          borderRight: "none",
                          borderRadius: pIdx === policyTables.length - 1 ? "0 0 0 10px" : 0,
                          padding: "14px 16px",
                          position: "sticky",
                          left: 0,
                          zIndex: 1,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{POLICY_ICONS[policy] ?? "📋"}</span>
                          <span className="text-sm font-medium text-white">{POLICY_LABELS[policy] ?? policy}</span>
                        </div>
                      </td>
                      {filteredRoles.map((role, rIdx) => {
                        const active = !!role.policies[policy];
                        const isSelected = panel?.role === role.name && panel?.policy === policy;
                        return (
                          <td
                            key={role.name}
                            onClick={() => openPanel(role, policy)}
                            title={active ? "Click to edit configuration" : "Click to configure"}
                            style={{
                              background: isSelected ? "rgba(228,0,75,0.15)" : active ? "rgba(228,0,75,0.07)" : "#0d1117",
                              border: `1px solid ${isSelected ? "#E4004B" : "#30363d"}`,
                              borderTop: "none",
                              borderLeft: "none",
                              borderRadius: pIdx === policyTables.length - 1 && rIdx === filteredRoles.length - 1 ? "0 0 10px 0" : 0,
                              textAlign: "center",
                              padding: "14px 16px",
                              cursor: "pointer",
                              transition: "all 0.12s",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected)
                                (e.currentTarget as HTMLElement).style.background = active
                                  ? "rgba(228,0,75,0.15)"
                                  : "rgba(255,255,255,0.04)";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected)
                                (e.currentTarget as HTMLElement).style.background = active
                                  ? "rgba(228,0,75,0.07)"
                                  : "#0d1117";
                            }}
                          >
                            {active ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full" style={{ background: "#E4004B" }}>
                                <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
                                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #30363d" }}>
                                <span style={{ color: "#8b949e", fontSize: 10 }}>+</span>
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ background: "#E4004B" }}>
                    <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="text-xs" style={{ color: "#8b949e" }}>Assigned — click to edit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #30363d" }}>
                    <span style={{ color: "#8b949e", fontSize: 10 }}>+</span>
                  </span>
                  <span className="text-xs" style={{ color: "#8b949e" }}>Not assigned — click to configure</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      {panel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setPanel(null)}
          />

          {/* Drawer */}
          <div
            className="fixed right-0 top-0 bottom-0 z-40 flex flex-col"
            style={{
              width: 380,
              background: "#161b22",
              borderLeft: "1px solid #30363d",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
            }}
          >
            {/* Panel header */}
            <div className="px-6 py-5 flex items-start justify-between" style={{ borderBottom: "1px solid #21262d" }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{POLICY_ICONS[panel.policy]}</span>
                  <span className="font-semibold text-white">{POLICY_LABELS[panel.policy]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: "rgba(228,0,75,0.15)", color: "#E4004B" }}>
                    {panel.role.replace(/_/g, " ")}
                  </span>
                  {panel.isNew && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)", color: "#8b949e" }}>
                      New
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setPanel(null)} style={{ color: "#8b949e" }} className="text-xl leading-none">×</button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {panelLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-sm" style={{ color: "#8b949e" }}>Loading config…</div>
                </div>
              ) : (
                <PolicyForm
                  policy={panel.policy}
                  values={panel.values}
                  onChange={updatePanelValue}
                />
              )}
            </div>

            {/* Panel footer */}
            <div className="px-6 py-4" style={{ borderTop: "1px solid #21262d" }}>
              {saveError && <p className="text-xs mb-3" style={{ color: "#ff7b72" }}>{saveError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={savePanel}
                  disabled={saving || panelLoading}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: "#E4004B", opacity: saving || panelLoading ? 0.6 : 1 }}
                >
                  {saving ? "Saving…" : panel.isNew ? "Enable & Save" : "Save Changes"}
                </button>
                {!panel.isNew && (
                  <button
                    onClick={removePolicy}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-semibold"
                    style={{ background: "rgba(255,123,114,0.12)", color: "#ff7b72", border: "1px solid rgba(255,123,114,0.2)" }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
