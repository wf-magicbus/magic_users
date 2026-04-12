"use client";

import { useEffect, useState } from "react";
import PolicyCard from "../PolicyCard";
import PolicyField from "../PolicyField";
import RolePicker, { type PolicyRole } from "../RolePicker";

interface LockoutPolicy {
  id: string;
  role: string;
  lockout_threshold_attempts: number;
  lockout_duration_minutes: number;
  reset_counter_after_minutes: number;
  updated_at: string;
}

function SuperAdminCard() {
  return (
    <div className="protected-card">
      <div className="protected-card-header">
        <div>
          <h3 className="protected-card-title">Account Lockout — Super Admin</h3>
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
        <p className="protected-card-text">Never locked out</p>
        <p className="protected-card-description">Super admins bypass all lockout restrictions by design</p>
      </div>
    </div>
  );
}

export default function LockoutPolicyTab() {
  const [activeRole, setActiveRole] = useState<PolicyRole>("student");
  const [policy, setPolicy] = useState<LockoutPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<LockoutPolicy>>({});
  const [saving, setSaving] = useState(false);

  const fetchPolicy = (role: PolicyRole) => {
    setLoading(true);
    fetch(`/api/lockout-policy?role=${role}`)
      .then(r => r.json())
      .then(d => setPolicy(d.error ? null : d))
      .catch(() => setPolicy(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setEditing(false); fetchPolicy(activeRole); }, [activeRole]);

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/lockout-policy?role=${activeRole}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
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
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--crimson)", borderTopColor: "transparent" }} />
          Loading…
        </div>
      ) : (
        <PolicyCard
          title={`Account Lockout — ${activeRole.replace(/_/g, " ")}`}
          editing={editing}
          saving={saving}
          onEdit={() => { setForm({ ...policy }); setEditing(true); }}
          onSave={saveEdit}
          onCancel={() => setEditing(false)}
        >
          <PolicyField
            label="Lockout Threshold"
            value={data?.lockout_threshold_attempts ?? 0}
            type="number" readOnly={!editing} suffix="failed attempts"
            onChange={v => setForm(f => ({ ...f, lockout_threshold_attempts: Number(v) }))}
          />
          <PolicyField
            label="Lockout Duration"
            value={data?.lockout_duration_minutes ?? 0}
            type="number" readOnly={!editing} suffix="minutes"
            onChange={v => setForm(f => ({ ...f, lockout_duration_minutes: Number(v) }))}
          />
          <PolicyField
            label="Reset Counter After"
            value={data?.reset_counter_after_minutes ?? 0}
            type="number" readOnly={!editing} suffix="minutes"
            onChange={v => setForm(f => ({ ...f, reset_counter_after_minutes: Number(v) }))}
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
