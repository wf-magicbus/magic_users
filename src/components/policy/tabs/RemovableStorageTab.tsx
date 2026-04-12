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
    <div className="protected-card">
      <div className="protected-card-header">
        <div>
          <h3 className="protected-card-title">Removable Storage — Super Admin</h3>
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
        <p className="protected-card-text">Full storage access</p>
        <p className="protected-card-description">Super admins can read, write, and execute from all removable storage devices</p>
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
      className={`toggle-switch ${value ? "enabled" : "disabled"}`}>
      <span className="toggle-switch-circle" />
    </button>
  );

  const readOnlyCell = (value: boolean) => (
    <span className={value ? "status-denied" : "status-allowed"}>
      {value ? "Denied" : "Allowed"}
    </span>
  );

  return (
    <div className="max-w-3xl">
      <RolePicker active={activeRole} onChange={r => setActiveRole(r)} />
      {loading ? (
        <div className="policy-loading">
          <div className="policy-loading-spinner" />
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
              onChange={v => setForm(f => ({ ...f, deny_all_access: v }))} />
          </div>
          <div className="overflow-x-auto">
            <table className="policy-table">
              <thead>
                <tr>
                  <th>Device Type</th>
                  <th className="text-center">Deny Read</th>
                  <th className="text-center">Deny Write</th>
                  <th className="text-center">Deny Execute</th>
                </tr>
              </thead>
              <tbody>
                {deviceTypes.map((device, i) => (
                  <tr key={device.label}>
                    <td style={{ fontWeight: "500" }}>{device.label}</td>
                    <td className="text-center">
                      {editing ? toggleCell(device.readKey, (data as any)?.[device.readKey] ?? false) : readOnlyCell((data as any)?.[device.readKey] ?? false)}
                    </td>
                    <td className="text-center">
                      {editing ? toggleCell(device.writeKey, (data as any)?.[device.writeKey] ?? false) : readOnlyCell((data as any)?.[device.writeKey] ?? false)}
                    </td>
                    <td className="text-center">
                      {device.executeKey
                        ? editing ? toggleCell(device.executeKey, (data as any)?.[device.executeKey] ?? false) : readOnlyCell((data as any)?.[device.executeKey] ?? false)
                        : <span className="small-text">—</span>}
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
