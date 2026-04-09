"use client";

import { useEffect, useState } from "react";
import PolicyCard from "../PolicyCard";
import PolicyToggle from "../PolicyToggle";
import RolePicker, { type PolicyRole } from "../RolePicker";

interface RemovableStoragePolicy {
  id: string;
  role: string;
  deny_all_access: boolean;
  removable_disk_deny_read: boolean;
  removable_disk_deny_write: boolean;
  removable_disk_deny_execute: boolean;
  cd_dvd_deny_read: boolean;
  cd_dvd_deny_write: boolean;
  wpd_device_deny_read: boolean;
  wpd_device_deny_write: boolean;
  floppy_deny_read: boolean;
  floppy_deny_write: boolean;
  tape_deny_read: boolean;
  tape_deny_write: boolean;
  updated_at: string;
}

const deviceTypes = [
  { label: "Removable Disks (USB)", readKey: "removable_disk_deny_read" as const, writeKey: "removable_disk_deny_write" as const, executeKey: "removable_disk_deny_execute" as const },
  { label: "CD / DVD", readKey: "cd_dvd_deny_read" as const, writeKey: "cd_dvd_deny_write" as const, executeKey: null },
  { label: "WPD Devices (Phones)", readKey: "wpd_device_deny_read" as const, writeKey: "wpd_device_deny_write" as const, executeKey: null },
  { label: "Floppy Drives", readKey: "floppy_deny_read" as const, writeKey: "floppy_deny_write" as const, executeKey: null },
  { label: "Tape Drives", readKey: "tape_deny_read" as const, writeKey: "tape_deny_write" as const, executeKey: null },
];

function SuperAdminCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>Removable Storage — Super Admin</h3>
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
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-1)" }}>Full storage access</p>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>Super admins can read, write, and execute from all removable storage devices</p>
      </div>
    </div>
  );
}

export default function RemovableStorageTab() {
  const [activeRole, setActiveRole] = useState<PolicyRole>("student");
  const [policy, setPolicy] = useState<RemovableStoragePolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<RemovableStoragePolicy>>({});
  const [saving, setSaving] = useState(false);

  const fetchPolicy = (role: PolicyRole) => {
    setLoading(true);
    fetch(`/api/removable-storage-policy?role=${role}`)
      .then(r => r.json())
      .then(d => setPolicy(d.error ? null : d))
      .catch(() => setPolicy(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setEditing(false); fetchPolicy(activeRole); }, [activeRole]);

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/removable-storage-policy?role=${activeRole}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (res.ok) { fetchPolicy(activeRole); setEditing(false); }
    } finally { setSaving(false); }
  };

  if (activeRole === "super_admin") return (
    <div className="max-w-3xl">
      <RolePicker active={activeRole} onChange={r => setActiveRole(r)} />
      <SuperAdminCard />
    </div>
  );

  const data = editing ? form : policy;

  const toggleCell = (key: keyof RemovableStoragePolicy, value: boolean) => (
    <button type="button" onClick={() => setForm(f => ({ ...f, [key]: !value }))}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
      style={{ background: value ? "var(--crimson)" : "var(--silver)" }}>
      <span className="inline-block rounded-full bg-white shadow-sm transition-transform"
        style={{ width: 14, height: 14, transform: value ? "translateX(18px)" : "translateX(2px)" }}/>
    </button>
  );

  const readOnlyCell = (value: boolean) => (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={value ? { background: "var(--crimson-50)", color: "var(--crimson)" } : { background: "var(--silver-50)", color: "var(--text-3)" }}>
      {value ? "Denied" : "Allowed"}
    </span>
  );

  return (
    <div className="max-w-3xl">
      <RolePicker active={activeRole} onChange={r => setActiveRole(r)} />
      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm" style={{ color: "var(--text-3)" }}>
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--crimson)", borderTopColor: "transparent" }}/>
          Loading…
        </div>
      ) : (
        <PolicyCard
          title={`Removable Storage — ${activeRole.replace(/_/g, " ")}`}
          editing={editing}
          saving={saving}
          onEdit={() => { setForm({ ...policy }); setEditing(true); }}
          onSave={saveEdit}
          onCancel={() => setEditing(false)}
        >
          <div className="pb-2 mb-2">
            <PolicyToggle label="Deny All Removable Storage Access" description="Master switch — overrides all individual settings below"
              value={data?.deny_all_access ?? false} readOnly={!editing}
              onChange={v => setForm(f => ({ ...f, deny_all_access: v }))}/>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="pb-2 pt-1 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Device Type</th>
                  <th className="pb-2 pt-1 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Deny Read</th>
                  <th className="pb-2 pt-1 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Deny Write</th>
                  <th className="pb-2 pt-1 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Deny Execute</th>
                </tr>
              </thead>
              <tbody>
                {deviceTypes.map((device, i) => (
                  <tr key={device.label} style={{ borderBottom: i < deviceTypes.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="py-3 font-medium" style={{ color: "var(--text-1)" }}>{device.label}</td>
                    <td className="py-3 text-center">
                      {editing ? toggleCell(device.readKey, (data as any)?.[device.readKey] ?? false) : readOnlyCell((data as any)?.[device.readKey] ?? false)}
                    </td>
                    <td className="py-3 text-center">
                      {editing ? toggleCell(device.writeKey, (data as any)?.[device.writeKey] ?? false) : readOnlyCell((data as any)?.[device.writeKey] ?? false)}
                    </td>
                    <td className="py-3 text-center">
                      {device.executeKey
                        ? editing ? toggleCell(device.executeKey, (data as any)?.[device.executeKey] ?? false) : readOnlyCell((data as any)?.[device.executeKey] ?? false)
                        : <span style={{ color: "var(--text-3)" }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PolicyCard>
      )}
    </div>
  );
}
