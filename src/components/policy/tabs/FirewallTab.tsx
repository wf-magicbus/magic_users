"use client";

import { useState } from "react";
import PolicyCard from "../PolicyCard";
import PolicyToggle from "../PolicyToggle";
import PolicyField from "../PolicyField";
import RolePicker from "../RolePicker";

interface FirewallProfile {
  id: string;
  role: string;
  profile: string;
  firewall_enabled: boolean;
  default_inbound_action: string;
  default_outbound_action: string;
  log_dropped_packets: boolean;
  log_successful_connections: boolean;
  log_file_path: string;
  log_max_size_kb: number;
  allow_local_firewall_rules: boolean;
  allow_local_ipsec_rules: boolean;
  updated_at: string;
}

const actionOptions = [
  { label: "Block", value: "block" },
  { label: "Allow", value: "allow" },
];

export default function FirewallTab() {
  const [role, setRole] = useState("");
  const [profiles, setProfiles] = useState<FirewallProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<FirewallProfile>>({});
  const [saving, setSaving] = useState(false);

  const fetchProfiles = (r: string) => {
    if (!r) return;
    setLoading(true);
    setEditingProfile(null);
    fetch(`/api/firewall-policy?role=${encodeURIComponent(r)}`)
      .then((res) => res.json())
      .then((data) => setProfiles(Array.isArray(data) ? data : []))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  };

  const handleRoleChange = (r: string) => { setRole(r); fetchProfiles(r); };
  const startEdit = (profile: FirewallProfile) => { setEditingProfile(profile.profile); setForm({ ...profile }); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/firewall-policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      if (res.ok) { fetchProfiles(role); setEditingProfile(null); }
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-5xl">
      <RolePicker active={role} onChange={handleRoleChange} />

      {!role ? null : loading ? (
        <div className="policy-loading">
          <div className="policy-loading-spinner" />
          Loading…
        </div>
      ) : profiles.length === 0 ? (
        <div className="py-4 text-sm small-text">
          No firewall policy configured for <strong>{role}</strong>. Assign it from the Roles page first.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => {
            const editing = editingProfile === profile.profile;
            const data = editing ? form : profile;

            return (
              <PolicyCard
                key={profile.id}
                title={`${profile.profile.charAt(0).toUpperCase() + profile.profile.slice(1)} Profile`}
                editing={editing}
                saving={saving}
                onEdit={() => startEdit(profile)}
                onSave={saveEdit}
                onCancel={() => setEditingProfile(null)}
              >
                <PolicyToggle label="Firewall Enabled" value={data.firewall_enabled ?? false} readOnly={!editing} onChange={(v) => setForm({ ...form, firewall_enabled: v })} />
                <PolicyField label="Default Inbound" value={data.default_inbound_action ?? "block"} type="select" options={actionOptions} readOnly={!editing} onChange={(v) => setForm({ ...form, default_inbound_action: String(v) })} />
                <PolicyField label="Default Outbound" value={data.default_outbound_action ?? "allow"} type="select" options={actionOptions} readOnly={!editing} onChange={(v) => setForm({ ...form, default_outbound_action: String(v) })} />

                <div className="policy-section-divider">
                  <h3 className="policy-section-title">Logging</h3>
                  <PolicyToggle label="Log Dropped Packets" value={data.log_dropped_packets ?? false} readOnly={!editing} onChange={(v) => setForm({ ...form, log_dropped_packets: v })} />
                  <PolicyToggle label="Log Successful Connections" value={data.log_successful_connections ?? false} readOnly={!editing} onChange={(v) => setForm({ ...form, log_successful_connections: v })} />
                </div>

                <div className="policy-section-divider">
                  <h3 className="policy-section-title">Rules</h3>
                  <PolicyToggle label="Allow Local Firewall Rules" value={data.allow_local_firewall_rules ?? false} readOnly={!editing} onChange={(v) => setForm({ ...form, allow_local_firewall_rules: v })} />
                  <PolicyToggle label="Allow Local IPsec Rules" value={data.allow_local_ipsec_rules ?? false} readOnly={!editing} onChange={(v) => setForm({ ...form, allow_local_ipsec_rules: v })} />
                </div>
              </PolicyCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
