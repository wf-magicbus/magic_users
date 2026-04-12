"use client";

import { useEffect, useState } from "react";
import PolicyCard from "../PolicyCard";
import PolicyToggle from "../PolicyToggle";
import PolicyField from "../PolicyField";
import RolePicker from "../RolePicker";

interface EndpointProtection {
  id: string;
  role: string;
  defender_enabled: boolean;
  realtime_protection_enabled: boolean;
  cloud_protection_enabled: boolean;
  automatic_sample_submission: boolean;
  scan_removable_drives: boolean;
  scheduled_scan_type: string;
  scheduled_scan_day: number;
  updated_at: string;
}

const scanTypeOptions = [
  { label: "Disabled", value: "disabled" },
  { label: "Quick Scan", value: "quick" },
  { label: "Full Scan", value: "full" },
];

const scanDayOptions = [
  { label: "Every Day", value: "0" },
  { label: "Sunday", value: "1" },
  { label: "Monday", value: "2" },
  { label: "Tuesday", value: "3" },
  { label: "Wednesday", value: "4" },
  { label: "Thursday", value: "5" },
  { label: "Friday", value: "6" },
  { label: "Saturday", value: "7" },
];

export default function EndpointProtectionTab() {
  const [role, setRole] = useState("");
  const [policy, setPolicy] = useState<EndpointProtection | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<EndpointProtection>>({});
  const [saving, setSaving] = useState(false);

  const fetchPolicy = (r: string) => {
    if (!r) return;
    setLoading(true);
    setEditing(false);
    fetch(`/api/endpoint-protection?role=${encodeURIComponent(r)}`)
      .then((res) => res.json())
      .then((data) => setPolicy(data && !data.error ? data : null))
      .catch(() => setPolicy(null))
      .finally(() => setLoading(false));
  };

  const handleRoleChange = (r: string) => {
    setRole(r);
    fetchPolicy(r);
  };

  const startEdit = () => { setEditing(true); setForm({ ...policy }); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/endpoint-protection", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      if (res.ok) { fetchPolicy(role); setEditing(false); }
    } finally { setSaving(false); }
  };

  const data = editing ? form : policy;

  return (
    <div className="max-w-3xl">
      <RolePicker active={role} onChange={handleRoleChange} />

      {!role ? null : loading ? (
        <div className="policy-loading">
          <div className="policy-loading-spinner" />
          Loading…
        </div>
      ) : !policy ? (
        <div className="py-4 text-sm small-text">
          No endpoint protection configured for <strong>{role}</strong>. Assign it from the Roles page first.
        </div>
      ) : (
        <PolicyCard
          title={`Endpoint Protection — ${role.replace(/_/g, " ")}`}
          editing={editing}
          saving={saving}
          onEdit={startEdit}
          onSave={saveEdit}
          onCancel={() => setEditing(false)}
        >
          <div className="pb-3 mb-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="policy-section-title">Microsoft Defender</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <PolicyToggle label="Microsoft Defender" value={data?.defender_enabled ?? false} readOnly={!editing} onChange={(v) => setForm({ ...form, defender_enabled: v })} />
              <PolicyToggle label="Real-time Protection" value={data?.realtime_protection_enabled ?? false} readOnly={!editing} onChange={(v) => setForm({ ...form, realtime_protection_enabled: v })} />
              <PolicyToggle label="Cloud Protection" value={data?.cloud_protection_enabled ?? false} readOnly={!editing} onChange={(v) => setForm({ ...form, cloud_protection_enabled: v })} />
              <PolicyToggle label="Automatic Sample Submission" value={data?.automatic_sample_submission ?? false} readOnly={!editing} onChange={(v) => setForm({ ...form, automatic_sample_submission: v })} />
              <PolicyToggle label="Scan Removable Drives" value={data?.scan_removable_drives ?? false} readOnly={!editing} onChange={(v) => setForm({ ...form, scan_removable_drives: v })} />
            </div>
          </div>
          <div className="policy-section-divider">
            <h3 className="policy-section-title">Scan Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <PolicyField label="Scan Type" value={data?.scheduled_scan_type ?? "disabled"} type="select" options={scanTypeOptions} readOnly={!editing} onChange={(v) => setForm({ ...form, scheduled_scan_type: String(v) })} />
              <PolicyField label="Scan Day" value={String(data?.scheduled_scan_day ?? 0)} type="select" options={scanDayOptions} readOnly={!editing} onChange={(v) => setForm({ ...form, scheduled_scan_day: Number(v) })} />
            </div>
          </div>
        </PolicyCard>
      )}
    </div>
  );
}
