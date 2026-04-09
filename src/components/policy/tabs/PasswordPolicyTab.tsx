"use client";

import { useEffect, useState } from "react";
import PolicyCard from "../PolicyCard";
import PolicyField from "../PolicyField";
import PolicyToggle from "../PolicyToggle";
import RolePicker, { type PolicyRole } from "../RolePicker";

interface PasswordPolicy {
  id: string;
  role: string;
  min_password_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_digit: boolean;
  require_special_char: boolean;
  password_history_depth: number;
  max_password_age_days: number;
  min_password_age_days: number;
  store_reversible_encryption: boolean;
  updated_at: string;
}

function SuperAdminCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>Password Policy — Super Admin</h3>
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
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-1)" }}>Strictest policy enforced</p>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>Super admin password policy is locked to the highest security standard and cannot be changed</p>
      </div>
    </div>
  );
}

export default function PasswordPolicyTab() {
  const [activeRole, setActiveRole] = useState<PolicyRole>("student");
  const [policy, setPolicy] = useState<PasswordPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<PasswordPolicy>>({});
  const [saving, setSaving] = useState(false);

  const fetchPolicy = (role: PolicyRole) => {
    setLoading(true);
    fetch(`/api/password-policy?role=${role}`)
      .then(r => r.json())
      .then(d => setPolicy(d.error ? null : d))
      .catch(() => setPolicy(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setEditing(false); fetchPolicy(activeRole); }, [activeRole]);

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/password-policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { fetchPolicy(activeRole); setEditing(false); }
    } finally { setSaving(false); }
  };

  if (activeRole === "super_admin") return (
    <div className="max-w-lg">
      <RolePicker active={activeRole} onChange={r => setActiveRole(r)} />
      <SuperAdminCard />
    </div>
  );

  const data = editing ? form : policy;

  return (
    <div className="max-w-lg">
      <RolePicker active={activeRole} onChange={r => setActiveRole(r)} />
      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm" style={{ color: "var(--text-3)" }}>
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--crimson)", borderTopColor: "transparent" }}/>
          Loading…
        </div>
      ) : (
        <PolicyCard
          title={`Password Policy — ${activeRole.replace(/_/g, " ")}`}
          editing={editing}
          saving={saving}
          onEdit={() => { setForm({ ...policy }); setEditing(true); }}
          onSave={saveEdit}
          onCancel={() => setEditing(false)}
        >
          <PolicyField
            label="Min Password Length"
            value={data?.min_password_length ?? 0}
            type="number" readOnly={!editing} suffix="characters"
            onChange={v => setForm(f => ({ ...f, min_password_length: Number(v) }))}
          />
          <PolicyToggle
            label="Require Uppercase"
            value={data?.require_uppercase ?? false}
            readOnly={!editing}
            onChange={v => setForm(f => ({ ...f, require_uppercase: v }))}
          />
          <PolicyToggle
            label="Require Lowercase"
            value={data?.require_lowercase ?? false}
            readOnly={!editing}
            onChange={v => setForm(f => ({ ...f, require_lowercase: v }))}
          />
          <PolicyToggle
            label="Require Digit"
            value={data?.require_digit ?? false}
            readOnly={!editing}
            onChange={v => setForm(f => ({ ...f, require_digit: v }))}
          />
          <PolicyToggle
            label="Require Special Character"
            value={data?.require_special_char ?? false}
            readOnly={!editing}
            onChange={v => setForm(f => ({ ...f, require_special_char: v }))}
          />
          <PolicyField
            label="Password History"
            value={data?.password_history_depth ?? 0}
            type="number" readOnly={!editing} suffix="remembered"
            onChange={v => setForm(f => ({ ...f, password_history_depth: Number(v) }))}
          />
          <PolicyField
            label="Max Password Age"
            value={data?.max_password_age_days ?? 0}
            type="number" readOnly={!editing} suffix="days"
            onChange={v => setForm(f => ({ ...f, max_password_age_days: Number(v) }))}
          />
          <PolicyField
            label="Min Password Age"
            value={data?.min_password_age_days ?? 0}
            type="number" readOnly={!editing} suffix="days"
            onChange={v => setForm(f => ({ ...f, min_password_age_days: Number(v) }))}
          />
          <PolicyToggle
            label="Reversible Encryption"
            value={data?.store_reversible_encryption ?? false}
            readOnly={!editing}
            onChange={v => setForm(f => ({ ...f, store_reversible_encryption: v }))}
          />
          {!editing && policy?.updated_at && (
            <div className="flex justify-between py-2.5">
              <span className="text-sm" style={{ color: "var(--text-3)" }}>Last Updated</span>
              <span className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{new Date(policy.updated_at).toLocaleString()}</span>
            </div>
          )}
        </PolicyCard>
      )}
    </div>
  );
}
