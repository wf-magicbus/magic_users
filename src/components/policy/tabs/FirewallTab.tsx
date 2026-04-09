"use client";

import { useEffect, useState } from "react";
import PolicyCard from "../PolicyCard";
import PolicyToggle from "../PolicyToggle";
import PolicyField from "../PolicyField";

interface FirewallProfile {
  id: string;
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
  const [profiles, setProfiles] = useState<FirewallProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<FirewallProfile>>({});
  const [saving, setSaving] = useState(false);

  const fetchProfiles = () => {
    fetch("/api/firewall-policy")
      .then((res) => res.json())
      .then((data) => setProfiles(Array.isArray(data) ? data : []))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfiles(); }, []);

  const startEdit = (profile: FirewallProfile) => {
    setEditingProfile(profile.profile);
    setForm({ ...profile });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/firewall-policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        fetchProfiles();
        setEditingProfile(null);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-4 text-sm" style={{ color: "var(--text-3)" }}>Loading firewall policy...</div>;

  return (
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
            <PolicyToggle
              label="Firewall Enabled"
              value={data.firewall_enabled ?? false}
              readOnly={!editing}
              onChange={(v) => setForm({ ...form, firewall_enabled: v })}
            />
            <PolicyField
              label="Default Inbound"
              value={data.default_inbound_action ?? "block"}
              type="select"
              options={actionOptions}
              readOnly={!editing}
              onChange={(v) => setForm({ ...form, default_inbound_action: String(v) })}
            />
            <PolicyField
              label="Default Outbound"
              value={data.default_outbound_action ?? "allow"}
              type="select"
              options={actionOptions}
              readOnly={!editing}
              onChange={(v) => setForm({ ...form, default_outbound_action: String(v) })}
            />

            <div className="pt-2 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-3)" }}>Logging</h3>
              <PolicyToggle
                label="Log Dropped Packets"
                value={data.log_dropped_packets ?? false}
                readOnly={!editing}
                onChange={(v) => setForm({ ...form, log_dropped_packets: v })}
              />
              <PolicyToggle
                label="Log Successful Connections"
                value={data.log_successful_connections ?? false}
                readOnly={!editing}
                onChange={(v) => setForm({ ...form, log_successful_connections: v })}
              />
            </div>

            <div className="pt-2 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-3)" }}>Rules</h3>
              <PolicyToggle
                label="Allow Local Firewall Rules"
                value={data.allow_local_firewall_rules ?? false}
                readOnly={!editing}
                onChange={(v) => setForm({ ...form, allow_local_firewall_rules: v })}
              />
              <PolicyToggle
                label="Allow Local IPsec Rules"
                value={data.allow_local_ipsec_rules ?? false}
                readOnly={!editing}
                onChange={(v) => setForm({ ...form, allow_local_ipsec_rules: v })}
              />
            </div>
          </PolicyCard>
        );
      })}
    </div>
  );
}
