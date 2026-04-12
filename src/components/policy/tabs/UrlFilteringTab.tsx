"use client";

import { useEffect, useState } from "react";
import RolePicker, { type PolicyRole } from "../RolePicker";

interface UrlRule {
  id: string;
  rule_type: string;
  role: string;
  value: string;
  description: string | null;
  is_active: boolean;
  target_browser: string;
  created_at: string;
}

const ruleTypes = [
  { key: "blocked_url", label: "Blocked URLs", bg: "var(--crimson-50)", color: "var(--crimson)" },
  { key: "allowed_url", label: "Allowed URLs", bg: "#F0FDF4", color: "#15803D" },
  { key: "blocked_category", label: "Blocked Categories", bg: "#FFF7ED", color: "#C2410C" },
  { key: "allowed_category", label: "Allowed Categories", bg: "var(--sky-50)", color: "var(--sky-dark)" },
] as const;

const browserOptions = [
  { label: "All Browsers", value: "all" },
  { label: "Chrome", value: "chrome" },
  { label: "Edge", value: "edge" },
];

const emptyForm = { value: "", description: "", target_browser: "all", is_active: true };

function SuperAdminPanel() {
  return (
    <div className="protected-card">
      <div className="protected-card-header">
        <div>
          <h3 className="protected-card-title">URL Filtering — Super Admin</h3>
          <p className="protected-card-subtitle">Protected · cannot be modified</p>
        </div>
        <span className="protected-badge">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
          Protected
        </span>
      </div>
      <div className="protected-card-content">
        <div className="protected-card-icon">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="protected-card-text">No URL filtering applied</p>
        <p className="protected-card-description">Super admins have unrestricted web access — no blocked or filtered URLs</p>
      </div>
    </div>
  );
}

export default function UrlFilteringTab() {
  const [activeRole, setActiveRole] = useState<PolicyRole>("student");
  const [rules, setRules] = useState<UrlRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("blocked_url");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchRules = () => {
    setLoading(true);
    fetch(`/api/url-filter-rules?role=${activeRole}&rule_type=${activeType}`)
      .then(r => r.json())
      .then(d => setRules(Array.isArray(d) ? d : []))
      .catch(() => setRules([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cancel(); fetchRules(); }, [activeRole, activeType]);

  const cancel = () => { setAdding(false); setEditingId(null); setForm(emptyForm); };

  const saveNew = async () => {
    if (!form.value.trim()) return;
    setSaving(true);
    try {
      const r = await fetch("/api/url-filter-rules", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rule_type: activeType, role: activeRole }),
      });
      if (r.ok) { fetchRules(); cancel(); }
    } finally { setSaving(false); }
  };

  const saveEdit = async () => {
    if (!form.value.trim() || !editingId) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/url-filter-rules/${editingId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (r.ok) { fetchRules(); cancel(); }
    } finally { setSaving(false); }
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Delete this rule?")) return;
    const r = await fetch(`/api/url-filter-rules/${id}`, { method: "DELETE" });
    if (r.ok) fetchRules();
  };

  const activeTypeMeta = ruleTypes.find(t => t.key === activeType)!;

  const FormRow = ({ onSave }: { onSave: () => void }) => (
    <tr className="url-filter-form-row">
      <td className="px-6 py-3">
        <input autoFocus type="text" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
          placeholder={activeType.includes("url") ? "https://example.com" : "Category name"}
          className="url-filter-form-input"
        />
      </td>
      <td className="px-6 py-3">
        <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Optional description" className="url-filter-form-input"
        />
      </td>
      <td className="px-6 py-3">
        <select value={form.target_browser} onChange={e => setForm({ ...form, target_browser: e.target.value })}
          className="url-filter-form-input">
          {browserOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </td>
      <td className="px-6 py-3 text-center">
        <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}
          className={`toggle-switch ${form.is_active ? "enabled" : "disabled"}`}>
          <span className="toggle-switch-circle" />
        </button>
      </td>
      <td className="px-6 py-3">
        <div className="flex gap-2">
          <button onClick={onSave} disabled={saving || !form.value.trim()}
            className="btn btn-primary text-xs py-1.5 px-3"
            style={{ opacity: saving || !form.value.trim() ? 0.5 : 1 }}>
            {saving ? "…" : "Save"}
          </button>
          <button onClick={cancel} className="btn btn-secondary text-xs py-1.5 px-3">Cancel</button>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <RolePicker active={activeRole} onChange={r => { setActiveRole(r); }} />

      {activeRole === "super_admin" ? <SuperAdminPanel /> : (
        <>
          <div className="url-filter-type-buttons">
            {ruleTypes.map(rt => (
              <button key={rt.key} onClick={() => { setActiveType(rt.key); cancel(); }}
                className={`url-filter-btn ${activeType === rt.key ? "active" : "inactive"}`}>
                {rt.label}
              </button>
            ))}
          </div>

          <div className="url-filter-container">
            <div className="url-filter-header">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: "#2f2a1f" }}>{activeTypeMeta.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full small-text" style={{ background: "#f3f3f3" }}>
                  {loading ? "…" : `${rules.length} rule${rules.length !== 1 ? "s" : ""}`} · {activeRole.replace(/_/g, " ")}
                </span>
              </div>
              {!adding && !editingId && (
                <button onClick={() => setAdding(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 btn btn-primary text-sm">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                  Add Rule
                </button>
              )}
            </div>

            <table className="url-filter-table">
              <thead>
                <tr>
                  {["Value / URL", "Description", "Browser", "Active", "Actions"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adding && <FormRow onSave={saveNew} />}
                {!loading && rules.map((rule, i) =>
                  editingId === rule.id ? <FormRow key={rule.id} onSave={saveEdit} /> : (
                    <tr key={rule.id}>
                      <td style={{ fontFamily: "monospace", fontSize: "13px" }}>{rule.value}</td>
                      <td className="small-text">{rule.description || <span className="small-text">—</span>}</td>
                      <td>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full capitalize" style={{ background: "#f3f3f3", color: "var(--text-2)" }}>{rule.target_browser}</span>
                      </td>
                      <td>
                        <span className={rule.is_active ? "url-filter-status-active" : "url-filter-status-inactive"}>
                          <span className="url-filter-status-dot" style={{ background: rule.is_active ? "#22c55e" : "#d4d4d4" }} />
                          {rule.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingId(rule.id); setAdding(false); setForm({ value: rule.value, description: rule.description || "", target_browser: rule.target_browser, is_active: rule.is_active }); }}
                            className="url-filter-btn-edit">Edit</button>
                          <button onClick={() => deleteRule(rule.id)}
                            className="url-filter-btn-delete">Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {!loading && rules.length === 0 && !adding && (
              <div className="url-filter-empty">
                <svg viewBox="0 0 20 20" fill="currentColor" className="url-filter-empty-icon">
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.499-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.499.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                </svg>
                <p className="text-sm small-text">No rules for {activeRole.replace(/_/g, " ")}. Add the first rule above.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
