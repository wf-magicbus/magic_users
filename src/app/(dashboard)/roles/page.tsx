"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";

// ─── Constants ───────────────────────────────────────────────────────────────

const POLICY_TABLES = [
  "password_policy",
  "lockout_policy",
  "url_filter_rules",
  "endpoint_protection",
  "firewall_policy",
  "hardening_policy",
  "logon_restrictions",
  "removable_storage_policy",
] as const;

type PolicyTable = typeof POLICY_TABLES[number];

const POLICY_META: Record<PolicyTable, { label: string; icon: string; description: string }> = {
  password_policy:         { label: "Password Policy",      icon: "🔑", description: "Complexity, length, history, age requirements" },
  lockout_policy:          { label: "Account Lockout",      icon: "🔒", description: "Threshold, duration, observation window" },
  url_filter_rules:        { label: "URL Filtering",        icon: "🌐", description: "Block or allow URLs and categories per browser" },
  endpoint_protection:     { label: "Endpoint Protection",  icon: "🛡️", description: "Defender, real-time protection, scheduled scans" },
  firewall_policy:         { label: "Firewall Policy",      icon: "🔥", description: "Inbound/outbound rules, logging, profiles" },
  hardening_policy:        { label: "System Hardening",     icon: "⚙️", description: "LAPS, UAC, BitLocker, PowerShell logging" },
  logon_restrictions:      { label: "Logon Restrictions",   icon: "🚪", description: "Local logon, RDP, service account restrictions" },
  removable_storage_policy:{ label: "Removable Storage",   icon: "💾", description: "USB, CD/DVD, WPD device access control" },
};

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = { name: string; policies: Record<string, boolean> };
type PanelTab = "assignments" | "settings";

// ─── Reusable form primitives ─────────────────────────────────────────────────

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm" style={{ color: "#c9d1d9" }}>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className="relative inline-flex items-center w-10 h-5 rounded-full transition-colors flex-shrink-0"
        style={{ background: checked ? "#E4004B" : "#30363d" }}
      >
        <span className="absolute w-4 h-4 bg-white rounded-full shadow transition-transform"
          style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }} />
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

function Input({ value, onChange, type = "text", min, max, placeholder }: {
  value: string | number; onChange: (v: string | number) => void;
  type?: string; min?: number; max?: number; placeholder?: string;
}) {
  return (
    <input
      type={type} value={value as string} min={min} max={max} placeholder={placeholder}
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
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
      style={{ background: "#0d1117", border: "1px solid #30363d", color: "#e6edf3" }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─── Policy-specific settings forms ──────────────────────────────────────────

function PolicyForm({ policy, values, onChange }: {
  policy: string; values: Record<string, unknown>; onChange: (key: string, val: unknown) => void;
}) {
  const v = values;
  const b = (k: string, def = true) => (v[k] === undefined ? def : Boolean(v[k]));
  const n = (k: string, def: number) => (v[k] === undefined ? def : Number(v[k]));
  const s = (k: string, def: string) => (v[k] === undefined ? def : String(v[k]));

  if (policy === "password_policy") return (
    <div>
      <Field label="Min Password Length"><Input type="number" value={n("min_password_length", 8)} min={4} max={128} onChange={(val) => onChange("min_password_length", val)} /></Field>
      <Field label="Max Password Age (days)"><Input type="number" value={n("max_password_age_days", 90)} min={0} onChange={(val) => onChange("max_password_age_days", val)} /></Field>
      <Field label="Min Password Age (days)"><Input type="number" value={n("min_password_age_days", 1)} min={0} onChange={(val) => onChange("min_password_age_days", val)} /></Field>
      <Field label="Password History Depth"><Input type="number" value={n("password_history_depth", 5)} min={0} max={50} onChange={(val) => onChange("password_history_depth", val)} /></Field>
      <div className="mt-2" style={{ borderTop: "1px solid #21262d", paddingTop: 8 }}>
        <Toggle label="Require Uppercase" checked={b("require_uppercase")} onChange={(v) => onChange("require_uppercase", v)} />
        <Toggle label="Require Lowercase" checked={b("require_lowercase")} onChange={(v) => onChange("require_lowercase", v)} />
        <Toggle label="Require Digit" checked={b("require_digit")} onChange={(v) => onChange("require_digit", v)} />
        <Toggle label="Require Special Character" checked={b("require_special_char")} onChange={(v) => onChange("require_special_char", v)} />
      </div>
    </div>
  );

  if (policy === "lockout_policy") return (
    <div>
      <Field label="Lockout Threshold (attempts)"><Input type="number" value={n("lockout_threshold_attempts", 5)} min={1} max={100} onChange={(v) => onChange("lockout_threshold_attempts", v)} /></Field>
      <Field label="Lockout Duration (minutes)"><Input type="number" value={n("lockout_duration_minutes", 30)} min={0} onChange={(v) => onChange("lockout_duration_minutes", v)} /></Field>
      <Field label="Observation Window (minutes)"><Input type="number" value={n("observation_window_minutes", 30)} min={1} onChange={(v) => onChange("observation_window_minutes", v)} /></Field>
    </div>
  );

  if (policy === "url_filter_rules") return (
    <div>
      <Field label="Rule Type">
        <Select value={s("rule_type", "blocked_url")} onChange={(v) => onChange("rule_type", v)} options={[
          { label: "Block URL", value: "blocked_url" },
          { label: "Allow URL", value: "allowed_url" },
          { label: "Block Category", value: "blocked_category" },
          { label: "Allow Category", value: "allowed_category" },
        ]} />
      </Field>
      <Field label="URL / Pattern"><Input value={s("value", "")} placeholder="e.g. social-media.com" onChange={(v) => onChange("value", v)} /></Field>
      <Field label="Target Browser">
        <Select value={s("target_browser", "all")} onChange={(v) => onChange("target_browser", v)} options={[
          { label: "All Browsers", value: "all" },
          { label: "Chrome", value: "chrome" },
          { label: "Edge", value: "edge" },
        ]} />
      </Field>
      <Field label="Description"><Input value={s("description", "")} onChange={(v) => onChange("description", v)} /></Field>
      <Toggle label="Active" checked={b("is_active", true)} onChange={(v) => onChange("is_active", v)} />
    </div>
  );

  if (policy === "endpoint_protection") return (
    <div>
      <Toggle label="Windows Defender Enabled" checked={b("defender_enabled")} onChange={(v) => onChange("defender_enabled", v)} />
      <Toggle label="Real-time Protection" checked={b("realtime_protection_enabled")} onChange={(v) => onChange("realtime_protection_enabled", v)} />
      <Toggle label="Cloud Protection" checked={b("cloud_protection_enabled")} onChange={(v) => onChange("cloud_protection_enabled", v)} />
      <Toggle label="Scan Removable Drives" checked={b("scan_removable_drives")} onChange={(v) => onChange("scan_removable_drives", v)} />
      <Toggle label="Automatic Sample Submission" checked={b("automatic_sample_submission", false)} onChange={(v) => onChange("automatic_sample_submission", v)} />
      <Field label="Scheduled Scan Type">
        <Select value={s("scheduled_scan_type", "quick")} onChange={(v) => onChange("scheduled_scan_type", v)} options={[
          { label: "Disabled", value: "disabled" },
          { label: "Quick Scan", value: "quick" },
          { label: "Full Scan", value: "full" },
        ]} />
      </Field>
      <Field label="Scheduled Scan Day">
        <Select value={s("scheduled_scan_day", "everyday")} onChange={(v) => onChange("scheduled_scan_day", v)} options={[
          { label: "Every Day", value: "everyday" },
          ...["sunday","monday","tuesday","wednesday","thursday","friday","saturday"].map(d => ({ label: d.charAt(0).toUpperCase()+d.slice(1), value: d }))
        ]} />
      </Field>
    </div>
  );

  if (policy === "firewall_policy") return (
    <div>
      <Field label="Network Profile">
        <Select value={s("profile", "domain")} onChange={(v) => onChange("profile", v)} options={[
          { label: "Domain", value: "domain" },
          { label: "Private", value: "private" },
          { label: "Public", value: "public" },
        ]} />
      </Field>
      <Toggle label="Firewall Enabled" checked={b("firewall_enabled")} onChange={(v) => onChange("firewall_enabled", v)} />
      <Field label="Default Inbound">
        <Select value={s("default_inbound_action", "block")} onChange={(v) => onChange("default_inbound_action", v)} options={[{ label: "Block", value: "block" }, { label: "Allow", value: "allow" }]} />
      </Field>
      <Field label="Default Outbound">
        <Select value={s("default_outbound_action", "allow")} onChange={(v) => onChange("default_outbound_action", v)} options={[{ label: "Allow", value: "allow" }, { label: "Block", value: "block" }]} />
      </Field>
      <Toggle label="Log Dropped Packets" checked={b("log_dropped_packets")} onChange={(v) => onChange("log_dropped_packets", v)} />
      <Toggle label="Log Successful Connections" checked={b("log_successful_connections", false)} onChange={(v) => onChange("log_successful_connections", v)} />
      <Toggle label="Allow Local Firewall Rules" checked={b("allow_local_firewall_rules", false)} onChange={(v) => onChange("allow_local_firewall_rules", v)} />
      <Field label="Log Max Size (KB)"><Input type="number" value={n("log_max_size_kb", 4096)} min={1} onChange={(v) => onChange("log_max_size_kb", v)} /></Field>
    </div>
  );

  if (policy === "hardening_policy") return (
    <div>
      <Field label="Local Admin Action">
        <Select value={s("local_admin_action", "rename")} onChange={(v) => onChange("local_admin_action", v)} options={[
          { label: "Rename", value: "rename" }, { label: "Remove", value: "remove" }, { label: "Keep", value: "keep" },
        ]} />
      </Field>
      {s("local_admin_action", "rename") === "rename" && (
        <Field label="New Admin Name"><Input value={s("local_admin_new_name", "BuiltInAdmin")} onChange={(v) => onChange("local_admin_new_name", v)} /></Field>
      )}
      <div className="mt-3" style={{ borderTop: "1px solid #21262d", paddingTop: 8 }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#8b949e" }}>LAPS</p>
        <Toggle label="LAPS Enabled" checked={b("laps_enabled")} onChange={(v) => onChange("laps_enabled", v)} />
        <Field label="Password Length"><Input type="number" value={n("laps_password_length", 20)} min={8} max={64} onChange={(v) => onChange("laps_password_length", v)} /></Field>
        <Field label="Password Age (days)"><Input type="number" value={n("laps_password_age_days", 30)} min={1} onChange={(v) => onChange("laps_password_age_days", v)} /></Field>
      </div>
      <div className="mt-3" style={{ borderTop: "1px solid #21262d", paddingTop: 8 }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#8b949e" }}>UAC</p>
        <Toggle label="UAC Enabled" checked={b("uac_enabled")} onChange={(v) => onChange("uac_enabled", v)} />
        <Field label="UAC Level">
          <Select value={s("uac_level", "always_notify")} onChange={(v) => onChange("uac_level", v)} options={[
            { label: "Always Notify", value: "always_notify" },
            { label: "Notify on Changes", value: "notify_changes" },
            { label: "Never", value: "never" },
          ]} />
        </Field>
      </div>
      <div className="mt-3" style={{ borderTop: "1px solid #21262d", paddingTop: 8 }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#8b949e" }}>PowerShell & BitLocker</p>
        <Toggle label="PS Logging Enabled" checked={b("powershell_logging_enabled")} onChange={(v) => onChange("powershell_logging_enabled", v)} />
        <Toggle label="PS Script Block Logging" checked={b("powershell_script_block_logging")} onChange={(v) => onChange("powershell_script_block_logging", v)} />
        <Toggle label="BitLocker Enabled" checked={b("bitlocker_enabled")} onChange={(v) => onChange("bitlocker_enabled", v)} />
        <Field label="Encryption Method">
          <Select value={s("bitlocker_encryption_method", "xts_aes_256")} onChange={(v) => onChange("bitlocker_encryption_method", v)} options={[
            { label: "AES-128", value: "aes_128" }, { label: "AES-256", value: "aes_256" },
            { label: "XTS-AES-128", value: "xts_aes_128" }, { label: "XTS-AES-256", value: "xts_aes_256" },
          ]} />
        </Field>
      </div>
    </div>
  );

  if (policy === "logon_restrictions") return (
    <div>
      <Toggle label="Admin Local Logon Only" checked={b("admin_local_logon_only")} onChange={(v) => onChange("admin_local_logon_only", v)} />
      <Toggle label="RDP Admin Only" checked={b("rdp_admin_only")} onChange={(v) => onChange("rdp_admin_only", v)} />
      <Toggle label="Deny Service Account Local Logon" checked={b("deny_service_account_local_logon")} onChange={(v) => onChange("deny_service_account_local_logon", v)} />
      <Toggle label="Deny Interactive Service Logon" checked={b("deny_interactive_service_logon", false)} onChange={(v) => onChange("deny_interactive_service_logon", v)} />
    </div>
  );

  if (policy === "removable_storage_policy") return (
    <div>
      <Toggle label="Deny All Access (Master Switch)" checked={b("deny_all_access")} onChange={(v) => onChange("deny_all_access", v)} />
      <div className="mt-3" style={{ borderTop: "1px solid #21262d", paddingTop: 8 }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#8b949e" }}>USB / Removable Disk</p>
        <Toggle label="Deny Read" checked={b("removable_disk_deny_read")} onChange={(v) => onChange("removable_disk_deny_read", v)} />
        <Toggle label="Deny Write" checked={b("removable_disk_deny_write")} onChange={(v) => onChange("removable_disk_deny_write", v)} />
        <Toggle label="Deny Execute" checked={b("removable_disk_deny_execute")} onChange={(v) => onChange("removable_disk_deny_execute", v)} />
      </div>
      <div className="mt-3" style={{ borderTop: "1px solid #21262d", paddingTop: 8 }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#8b949e" }}>CD / DVD</p>
        <Toggle label="Deny Read" checked={b("cd_dvd_deny_read", false)} onChange={(v) => onChange("cd_dvd_deny_read", v)} />
        <Toggle label="Deny Write" checked={b("cd_dvd_deny_write")} onChange={(v) => onChange("cd_dvd_deny_write", v)} />
      </div>
      <div className="mt-3" style={{ borderTop: "1px solid #21262d", paddingTop: 8 }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#8b949e" }}>WPD (Phones / Cameras)</p>
        <Toggle label="Deny Read" checked={b("wpd_device_deny_read", false)} onChange={(v) => onChange("wpd_device_deny_read", v)} />
        <Toggle label="Deny Write" checked={b("wpd_device_deny_write")} onChange={(v) => onChange("wpd_device_deny_write", v)} />
      </div>
    </div>
  );

  return <p style={{ color: "#8b949e" }} className="text-sm">No form available.</p>;
}

// ─── OU DN helper ─────────────────────────────────────────────────────────────

function ouDN(role: string) {
  const segment = role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return `OU=${segment},DC=MAGICBUS,DC=ENTRA`;
}

function roleColor(role: string) {
  const colors = ["#1f6feb","#388bfd","#58a6ff","#79c0ff","#a5d6ff"];
  let hash = 0;
  for (const c of role) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[hash % colors.length];
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PolicyAssignmentPage() {
  const { loading: authLoading } = useAuthGuard();

  // Data
  const [roles, setRoles] = useState<Role[]>([]);
  const [allRoles, setAllRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Panel state
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyTable | null>(null);
  const [panelTab, setPanelTab] = useState<PanelTab>("assignments");
  const [settingsRole, setSettingsRole] = useState<string>("");
  const [settingsValues, setSettingsValues] = useState<Record<string, unknown>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [saving, setSaving] = useState<string>("");  // role being toggled or "settings"
  const [saveError, setSaveError] = useState("");
  const [newRoleName, setNewRoleName] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/roles");
    const data = await res.json();
    const r: Role[] = data.roles ?? [];
    setRoles(r);
    setAllRoles(r.map((x) => x.name));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Load settings for a role+policy
  const loadSettings = async (policy: PolicyTable, role: string) => {
    if (!role) return;
    setSettingsLoading(true);
    setSettingsValues({});
    const res = await fetch(`/api/roles/policy?role=${encodeURIComponent(role)}&table=${encodeURIComponent(policy)}`);
    const data = await res.json();
    setSettingsValues(data.data?.[0] ?? {});
    setSettingsLoading(false);
  };

  const openPanel = (policy: PolicyTable) => {
    setSelectedPolicy(policy);
    setPanelTab("assignments");
    setSaveError("");
    setNewRoleName("");
    setSettingsRole("");
    setSettingsValues({});
  };

  const closePanel = () => {
    setSelectedPolicy(null);
    setSaveError("");
  };

  // Switch to settings tab for a specific role
  const editSettings = async (policy: PolicyTable, role: string) => {
    setSettingsRole(role);
    setPanelTab("settings");
    await loadSettings(policy, role);
  };

  // Toggle a role's assignment to this policy
  const toggleRoleAssignment = async (policy: PolicyTable, role: string, enable: boolean) => {
    setSaving(role);
    setSaveError("");
    const res = await fetch("/api/roles/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, policy_table: policy, enabled: enable }),
    });
    if (!res.ok) {
      const d = await res.json();
      setSaveError(d.error ?? "Failed to update");
    } else {
      await fetchAll();
    }
    setSaving("");
  };

  // Add a new role via the "new role" input
  const addNewRole = async (policy: PolicyTable) => {
    const name = newRoleName.trim().toLowerCase().replace(/\s+/g, "_");
    if (!name) return;
    setSaving("__new__");
    setSaveError("");
    // Create role (seeds password_policy row) then enable this policy
    await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (policy !== "password_policy") {
      await fetch("/api/roles/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: name, policy_table: policy, enabled: true }),
      });
    }
    setNewRoleName("");
    setSaving("");
    await fetchAll();
  };

  // Save settings for the current role
  const saveSettings = async () => {
    if (!selectedPolicy || !settingsRole) return;
    setSaving("settings");
    setSaveError("");
    const res = await fetch("/api/roles/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: settingsRole, policy_table: selectedPolicy, enabled: true, values: settingsValues }),
    });
    if (!res.ok) {
      const d = await res.json();
      setSaveError(d.error ?? "Failed to save");
    } else {
      await fetchAll();
    }
    setSaving("");
  };

  // Which roles have this policy enabled
  const policyRoles = (policy: PolicyTable) =>
    roles.filter((r) => r.policies[policy]).map((r) => r.name);

  if (authLoading) return null;

  return (
    <div className="flex-1 flex min-h-screen" style={{ background: "#0d1117" }}>
      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-8 pt-8 pb-5" style={{ borderBottom: "1px solid #21262d" }}>
          <h1 className="text-2xl font-bold text-white tracking-tight">Policy Assignment</h1>
          <p className="text-sm mt-1" style={{ color: "#8b949e" }}>
            Configure each policy and assign it to roles. Roles map to AD Organizational Units in MAGICBUS.ENTRA.
          </p>
        </div>

        {/* Policy cards grid */}
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#E4004B #30363d #30363d" }} />
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
              {POLICY_TABLES.map((policy) => {
                const meta = POLICY_META[policy];
                const assigned = policyRoles(policy);
                const isOpen = selectedPolicy === policy;

                return (
                  <button
                    key={policy}
                    onClick={() => isOpen ? closePanel() : openPanel(policy)}
                    className="text-left rounded-xl p-5 transition-all"
                    style={{
                      background: isOpen ? "#161b22" : "#0d1117",
                      border: isOpen ? "1.5px solid #E4004B" : "1px solid #30363d",
                      cursor: "pointer",
                    }}
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{meta.icon}</span>
                        <div>
                          <p className="font-semibold text-sm text-white">{meta.label}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#8b949e" }}>{meta.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {assigned.length > 0 && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#3fb950" }} />
                        )}
                        <span className="text-xs" style={{ color: "#8b949e" }}>
                          {assigned.length === 0 ? "Unassigned" : `${assigned.length} role${assigned.length > 1 ? "s" : ""}`}
                        </span>
                      </div>
                    </div>

                    {/* Role pills */}
                    {assigned.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {assigned.map((r) => (
                          <span key={r} className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: roleColor(r) + "22", color: roleColor(r), border: `1px solid ${roleColor(r)}44` }}>
                            {r}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic" style={{ color: "#484f58" }}>No roles assigned — click to configure</p>
                    )}

                    {/* Configure button */}
                    <div className="mt-4 flex items-center gap-1.5" style={{ color: isOpen ? "#E4004B" : "#58a6ff" }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
                      </svg>
                      <span className="text-xs font-medium">{isOpen ? "Close panel" : "Configure & assign"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Side Panel ── */}
      {selectedPolicy && (
        <>
          {/* Backdrop on small screens */}
          <div className="fixed inset-0 z-10 lg:hidden" onClick={closePanel} style={{ background: "rgba(0,0,0,0.5)" }} />

          <div className="flex-shrink-0 flex flex-col border-l z-20"
            style={{ width: 400, background: "#0d1117", borderColor: "#21262d", overflowY: "auto" }}>
            {/* Panel header */}
            <div className="px-5 pt-6 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid #21262d" }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{POLICY_META[selectedPolicy].icon}</span>
                  <h2 className="text-base font-semibold text-white">{POLICY_META[selectedPolicy].label}</h2>
                </div>
                <button onClick={closePanel} className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[#161b22]"
                  style={{ color: "#8b949e" }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/>
                  </svg>
                </button>
              </div>
              <p className="text-xs" style={{ color: "#8b949e" }}>{POLICY_META[selectedPolicy].description}</p>

              {/* Tabs */}
              <div className="flex gap-1 mt-4">
                {(["assignments", "settings"] as PanelTab[]).map((tab) => (
                  <button key={tab} onClick={() => {
                    setPanelTab(tab);
                    if (tab === "settings" && !settingsRole && policyRoles(selectedPolicy).length > 0) {
                      editSettings(selectedPolicy, policyRoles(selectedPolicy)[0]);
                    }
                  }}
                    className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors"
                    style={{
                      background: panelTab === tab ? "#161b22" : "transparent",
                      color: panelTab === tab ? "#e6edf3" : "#8b949e",
                      border: panelTab === tab ? "1px solid #30363d" : "1px solid transparent",
                    }}>
                    {tab === "assignments" ? "Role Assignments" : "Settings"}
                  </button>
                ))}
              </div>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {saveError && (
                <div className="mb-4 px-3 py-2 rounded-lg text-xs" style={{ background: "#ff7b7222", border: "1px solid #ff7b7244", color: "#ff7b72" }}>
                  {saveError}
                </div>
              )}

              {/* ── ASSIGNMENTS TAB ── */}
              {panelTab === "assignments" && (
                <div>
                  <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "#8b949e" }}>
                    Roles / OUs
                  </p>

                  {allRoles.length === 0 ? (
                    <p className="text-sm italic" style={{ color: "#484f58" }}>No roles yet — add one below.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {allRoles.map((role) => {
                        const enabled = policyRoles(selectedPolicy).includes(role);
                        const isToggling = saving === role;
                        return (
                          <div key={role} className="rounded-lg p-3 flex flex-col gap-2"
                            style={{ background: enabled ? "#161b22" : "#0d1117", border: `1px solid ${enabled ? "#30363d" : "#21262d"}` }}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {enabled && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#3fb950" }} />}
                                <span className="text-sm font-medium" style={{ color: enabled ? "#e6edf3" : "#8b949e" }}>{role}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {enabled && (
                                  <button
                                    onClick={() => editSettings(selectedPolicy, role)}
                                    className="text-xs px-2 py-0.5 rounded"
                                    style={{ color: "#58a6ff", background: "#1f6feb22", border: "1px solid #1f6feb33" }}>
                                    Edit settings
                                  </button>
                                )}
                                <button
                                  disabled={isToggling}
                                  onClick={() => toggleRoleAssignment(selectedPolicy, role, !enabled)}
                                  className="relative inline-flex items-center w-9 h-5 rounded-full transition-colors flex-shrink-0"
                                  style={{ background: enabled ? "#E4004B" : "#30363d", opacity: isToggling ? 0.6 : 1 }}>
                                  <span className="absolute w-3.5 h-3.5 bg-white rounded-full shadow transition-transform"
                                    style={{ transform: enabled ? "translateX(18px)" : "translateX(2px)" }} />
                                </button>
                              </div>
                            </div>
                            {enabled && (
                              <p className="text-xs font-mono" style={{ color: "#484f58" }}>{ouDN(role)}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add new role */}
                  <div className="mt-5" style={{ borderTop: "1px solid #21262d", paddingTop: 16 }}>
                    <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#8b949e" }}>Add New Role</p>
                    <div className="flex gap-2">
                      <input
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addNewRole(selectedPolicy)}
                        placeholder="e.g. students, teachers"
                        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: "#161b22", border: "1px solid #30363d", color: "#e6edf3" }}
                      />
                      <button
                        onClick={() => addNewRole(selectedPolicy)}
                        disabled={!newRoleName.trim() || saving === "__new__"}
                        className="px-3 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0"
                        style={{ background: "#E4004B", opacity: !newRoleName.trim() || saving === "__new__" ? 0.5 : 1 }}>
                        Add
                      </button>
                    </div>
                    {newRoleName.trim() && (
                      <p className="text-xs mt-1.5 font-mono" style={{ color: "#484f58" }}>
                        → {ouDN(newRoleName.trim().toLowerCase().replace(/\s+/g, "_"))}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── SETTINGS TAB ── */}
              {panelTab === "settings" && (
                <div>
                  {/* Role picker for settings */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#8b949e" }}>Editing settings for</p>
                    {policyRoles(selectedPolicy).length === 0 ? (
                      <div className="rounded-lg p-3 text-sm" style={{ background: "#161b22", border: "1px solid #30363d", color: "#8b949e" }}>
                        No roles assigned to this policy yet.{" "}
                        <button onClick={() => setPanelTab("assignments")} style={{ color: "#58a6ff" }}>Assign roles first</button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {policyRoles(selectedPolicy).map((r) => (
                          <button
                            key={r}
                            onClick={() => editSettings(selectedPolicy, r)}
                            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                            style={{
                              background: settingsRole === r ? roleColor(r) : roleColor(r) + "22",
                              color: settingsRole === r ? "#fff" : roleColor(r),
                              border: `1px solid ${roleColor(r)}44`,
                            }}>
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {settingsRole && (
                    <>
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-xs" style={{ color: "#8b949e" }}>Configuring for</span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: "#161b22", border: "1px solid #30363d", color: "#e6edf3" }}>{settingsRole}</span>
                      </div>

                      {settingsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#E4004B #30363d #30363d" }} />
                        </div>
                      ) : (
                        <div style={{ borderTop: "1px solid #21262d", paddingTop: 12 }}>
                          <PolicyForm
                            policy={selectedPolicy}
                            values={settingsValues}
                            onChange={(key, val) => setSettingsValues((prev) => ({ ...prev, [key]: val }))}
                          />
                        </div>
                      )}

                      <div className="mt-5 pt-4 flex gap-2" style={{ borderTop: "1px solid #21262d" }}>
                        <button
                          onClick={saveSettings}
                          disabled={saving === "settings" || settingsLoading}
                          className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-opacity"
                          style={{ background: "#E4004B", opacity: saving === "settings" || settingsLoading ? 0.6 : 1 }}>
                          {saving === "settings" ? "Saving…" : "Save Changes"}
                        </button>
                        <button
                          onClick={() => setPanelTab("assignments")}
                          className="px-4 py-2 rounded-lg text-sm font-medium"
                          style={{ background: "#161b22", border: "1px solid #30363d", color: "#8b949e" }}>
                          Back
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
