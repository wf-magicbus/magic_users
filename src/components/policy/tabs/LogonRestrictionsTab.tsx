"use client";

import { useEffect, useState } from "react";
import PolicyCard from "../PolicyCard";
import PolicyToggle from "../PolicyToggle";
import ArrayField from "../ArrayField";
import RolePicker, { type PolicyRole } from "../RolePicker";

interface LogonRestrictions {
  id: string;
  role: string;
  admin_local_logon_only: boolean;
  local_logon_allowed_groups: string[];
  rdp_admin_only: boolean;
  rdp_allowed_groups: string[];
  deny_service_account_local_logon: boolean;
  deny_local_logon_groups: string[];
  deny_interactive_service_logon: boolean;
  deny_service_logon_groups: string[];
  deny_rdp_groups: string[];
  updated_at: string;
}

function SuperAdminCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>Logon Restrictions — Super Admin</h3>
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
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-1)" }}>Unrestricted access</p>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>Super admins can log on anywhere — local, RDP, service — without restriction</p>
      </div>
    </div>
  );
}

export default function LogonRestrictionsTab() {
  const [activeRole, setActiveRole] = useState<PolicyRole>("student");
  const [policy, setPolicy] = useState<LogonRestrictions | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<LogonRestrictions>>({});
  const [saving, setSaving] = useState(false);

  const fetchPolicy = (role: PolicyRole) => {
    setLoading(true);
    fetch(`/api/logon-restrictions?role=${role}`)
      .then(r => r.json())
      .then(d => setPolicy(d.error ? null : d))
      .catch(() => setPolicy(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setEditing(false); fetchPolicy(activeRole); }, [activeRole]);

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/logon-restrictions?role=${activeRole}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (res.ok) { fetchPolicy(activeRole); setEditing(false); }
    } finally { setSaving(false); }
  };

  if (activeRole === "super_admin") return (
    <div className="max-w-2xl">
      <RolePicker active={activeRole} onChange={r => setActiveRole(r)} />
      <SuperAdminCard />
    </div>
  );

  const data = editing ? form : policy;

  return (
    <div className="max-w-2xl">
      <RolePicker active={activeRole} onChange={r => setActiveRole(r)} />
      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm" style={{ color: "var(--text-3)" }}>
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--crimson)", borderTopColor: "transparent" }}/>
          Loading…
        </div>
      ) : (
        <PolicyCard
          title={`Logon Restrictions — ${activeRole.replace(/_/g, " ")}`}
          editing={editing}
          saving={saving}
          onEdit={() => { setForm({ ...policy }); setEditing(true); }}
          onSave={saveEdit}
          onCancel={() => setEditing(false)}
        >
          <div className="pb-3 mb-1" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-1)" }}>Local Logon</h3>
            <PolicyToggle label="Only admins allowed local logon" value={data?.admin_local_logon_only ?? false} readOnly={!editing} onChange={v => setForm(f => ({ ...f, admin_local_logon_only: v }))}/>
            <ArrayField label="Allowed groups" values={data?.local_logon_allowed_groups ?? []} readOnly={!editing} onChange={v => setForm(f => ({ ...f, local_logon_allowed_groups: v }))}/>
          </div>
          <div className="pb-3 mb-1" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-1)" }}>Remote Desktop (RDP)</h3>
            <PolicyToggle label="RDP restricted to admin group only" value={data?.rdp_admin_only ?? false} readOnly={!editing} onChange={v => setForm(f => ({ ...f, rdp_admin_only: v }))}/>
            <ArrayField label="RDP allowed groups" values={data?.rdp_allowed_groups ?? []} readOnly={!editing} onChange={v => setForm(f => ({ ...f, rdp_allowed_groups: v }))}/>
            <ArrayField label="Deny RDP groups" values={data?.deny_rdp_groups ?? []} readOnly={!editing} onChange={v => setForm(f => ({ ...f, deny_rdp_groups: v }))}/>
          </div>
          <div className="pb-3 mb-1" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-1)" }}>Service Accounts</h3>
            <PolicyToggle label="Deny local logon to service accounts" value={data?.deny_service_account_local_logon ?? false} readOnly={!editing} onChange={v => setForm(f => ({ ...f, deny_service_account_local_logon: v }))}/>
            <PolicyToggle label="Deny interactive service logon" value={data?.deny_interactive_service_logon ?? false} readOnly={!editing} onChange={v => setForm(f => ({ ...f, deny_interactive_service_logon: v }))}/>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-1)" }}>Deny Groups</h3>
            <ArrayField label="Deny local logon groups" values={data?.deny_local_logon_groups ?? []} readOnly={!editing} onChange={v => setForm(f => ({ ...f, deny_local_logon_groups: v }))}/>
            <ArrayField label="Deny service logon groups" values={data?.deny_service_logon_groups ?? []} readOnly={!editing} onChange={v => setForm(f => ({ ...f, deny_service_logon_groups: v }))}/>
          </div>
        </PolicyCard>
      )}
    </div>
  );
}
