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
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>URL Filtering — Super Admin</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>Protected · cannot be modified</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: "var(--gold-50)", color: "var(--gold-dark)" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
          Protected
        </span>
      </div>
      <div className="px-6 py-8 text-center">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--gold-50)" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6" style={{ color: "var(--gold-dark)" }}>
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-1)" }}>No URL filtering applied</p>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>Super admins have unrestricted web access — no blocked or filtered URLs</p>
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
  const inputStyle = { background: "var(--surface)", border: "1px solid var(--border-strong)", color: "var(--text-1)", outline: "none" };

  const FormRow = ({ onSave }: { onSave: () => void }) => (
    <tr style={{ background: "var(--crimson-50)" }}>
      <td className="px-6 py-3">
        <input autoFocus type="text" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
          placeholder={activeType.includes("url") ? "https://example.com" : "Category name"}
          className="w-full px-3 py-1.5 text-sm rounded-lg" style={inputStyle}
          onFocus={e => (e.target.style.borderColor = "var(--crimson)")}
          onBlur={e => (e.target.style.borderColor = "var(--border-strong)")}/>
      </td>
      <td className="px-6 py-3">
        <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Optional description" className="w-full px-3 py-1.5 text-sm rounded-lg" style={inputStyle}
          onFocus={e => (e.target.style.borderColor = "var(--crimson)")}
          onBlur={e => (e.target.style.borderColor = "var(--border-strong)")}/>
      </td>
      <td className="px-6 py-3">
        <select value={form.target_browser} onChange={e => setForm({ ...form, target_browser: e.target.value })}
          className="px-3 py-1.5 text-sm rounded-lg" style={inputStyle}>
          {browserOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </td>
      <td className="px-6 py-3 text-center">
        <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          style={{ background: form.is_active ? "var(--crimson)" : "var(--silver)" }}>
          <span className="inline-block rounded-full bg-white shadow-sm transition-transform"
            style={{ width: 18, height: 18, transform: form.is_active ? "translateX(20px)" : "translateX(2px)" }}/>
        </button>
      </td>
      <td className="px-6 py-3">
        <div className="flex gap-2">
          <button onClick={onSave} disabled={saving || !form.value.trim()}
            className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ background: "var(--crimson)" }}
            onMouseEnter={e => !saving && ((e.currentTarget as HTMLElement).style.background = "var(--crimson-dark)")}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson)"}>
            {saving ? "…" : "Save"}
          </button>
          <button onClick={cancel} className="px-3 py-1.5 text-xs font-semibold rounded-lg"
            style={{ background: "var(--silver-100)", color: "var(--text-2)" }}>Cancel</button>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <RolePicker active={activeRole} onChange={r => { setActiveRole(r); }} />

      {activeRole === "super_admin" ? <SuperAdminPanel /> : (
        <>
          <div className="flex gap-2 mb-5">
            {ruleTypes.map(rt => (
              <button key={rt.key} onClick={() => { setActiveType(rt.key); cancel(); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={activeType === rt.key ? { background: rt.bg, color: rt.color } : { background: "var(--silver-50)", color: "var(--text-3)" }}
                onMouseEnter={e => { if (activeType !== rt.key) (e.currentTarget as HTMLElement).style.background = "var(--silver-100)"; }}
                onMouseLeave={e => { if (activeType !== rt.key) (e.currentTarget as HTMLElement).style.background = "var(--silver-50)"; }}>
                {rt.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{activeTypeMeta.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--silver-100)", color: "var(--text-3)" }}>
                  {loading ? "…" : `${rules.length} rule${rules.length !== 1 ? "s" : ""}`} · {activeRole.replace(/_/g, " ")}
                </span>
              </div>
              {!adding && !editingId && (
                <button onClick={() => setAdding(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl transition-all"
                  style={{ background: "var(--crimson)", boxShadow: "0 4px 12px rgba(228,0,75,0.3)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson-dark)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson)"}>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
                  Add Rule
                </button>
              )}
            </div>

            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Value / URL", "Description", "Browser", "Active", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adding && <FormRow onSave={saveNew} />}
                {!loading && rules.map((rule, i) =>
                  editingId === rule.id ? <FormRow key={rule.id} onSave={saveEdit} /> : (
                    <tr key={rule.id} className="transition-colors"
                      style={{ borderBottom: i < rules.length - 1 ? "1px solid var(--border)" : "none" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                      <td className="px-6 py-4 text-sm font-mono font-medium" style={{ color: "var(--text-1)" }}>{rule.value}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>{rule.description || <span style={{ color: "var(--text-3)" }}>—</span>}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full capitalize" style={{ background: "var(--silver-100)", color: "var(--text-2)" }}>{rule.target_browser}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={rule.is_active ? { background: "#F0FDF4", color: "#15803D" } : { background: "var(--silver-50)", color: "var(--text-3)" }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: rule.is_active ? "#22C55E" : "var(--silver)" }}/>
                          {rule.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingId(rule.id); setAdding(false); setForm({ value: rule.value, description: rule.description || "", target_browser: rule.target_browser, is_active: rule.is_active }); }}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            style={{ background: "var(--sky-50)", color: "var(--sky-dark)" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--sky-100)"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--sky-50)"}>Edit</button>
                          <button onClick={() => deleteRule(rule.id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            style={{ background: "var(--crimson-50)", color: "var(--crimson)" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson-100)"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson-50)"}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {!loading && rules.length === 0 && !adding && (
              <div className="py-16 text-center">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--silver)" }}>
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.499-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.499.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd"/>
                </svg>
                <p className="text-sm" style={{ color: "var(--text-3)" }}>No rules for {activeRole.replace(/_/g, " ")}. Add the first rule above.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
