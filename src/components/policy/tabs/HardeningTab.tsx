"use client";

import { useState } from "react";
import PolicyCard from "../PolicyCard";
import PolicyToggle from "../PolicyToggle";
import PolicyField from "../PolicyField";
import RolePicker from "../RolePicker";

interface HardeningPolicy {
  id: string;
  local_admin_action: string;
  local_admin_new_name: string;
  laps_enabled: boolean;
  laps_password_length: number;
  laps_password_age_days: number;
  laps_password_complexity: string;
  uac_enabled: boolean;
  uac_level: string;
  uac_admin_approval_mode: boolean;
  uac_detect_installations: boolean;
  powershell_logging_enabled: boolean;
  powershell_script_block_logging: boolean;
  powershell_module_logging: boolean;
  powershell_transcription_enabled: boolean;
  powershell_transcription_path: string;
  bitlocker_enabled: boolean;
  bitlocker_require_tpm: boolean;
  bitlocker_encryption_method: string;
  updated_at: string;
}

const adminActionOptions = [
  { label: "Remove", value: "remove" },
  { label: "Rename", value: "rename" },
  { label: "Keep", value: "keep" },
];

const uacLevelOptions = [
  { label: "Always Notify", value: "always_notify" },
  { label: "Notify on Changes", value: "notify_changes" },
  { label: "Notify (No Dim)", value: "notify_no_dim" },
  { label: "Never Notify", value: "never_notify" },
];

const complexityOptions = [
  { label: "Letters + Digits", value: "letters_digits" },
  { label: "Letters + Digits + Special", value: "letters_digits_special" },
  { label: "All Characters", value: "all" },
];

const encryptionOptions = [
  { label: "XTS-AES 128", value: "xts_aes_128" },
  { label: "XTS-AES 256", value: "xts_aes_256" },
  { label: "AES-CBC 128", value: "aes_cbc_128" },
  { label: "AES-CBC 256", value: "aes_cbc_256" },
];

export default function HardeningTab() {
  const [role, setRole] = useState("");
  const [policy, setPolicy] = useState<HardeningPolicy | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<HardeningPolicy>>({});
  const [saving, setSaving] = useState(false);

  const fetchPolicy = (r: string) => {
    if (!r) return;
    setLoading(true);
    setEditing(false);
    fetch(`/api/hardening-policy?role=${encodeURIComponent(r)}`)
      .then((res) => res.json())
      .then((data) => setPolicy(data && !data.error ? data : null))
      .catch(() => setPolicy(null))
      .finally(() => setLoading(false));
  };

  const handleRoleChange = (r: string) => { setRole(r); fetchPolicy(r); };
  const startEdit = () => { setEditing(true); setForm({ ...policy }); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/hardening-policy", {
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
        <div className="py-4 text-sm" style={{ color: "var(--text-3)" }}>Loading…</div>
      ) : !policy ? (
        <div className="py-4 text-sm" style={{ color: "var(--text-3)" }}>
          No hardening policy configured for <strong>{role}</strong>. Assign it from the Roles page first.
        </div>
      ) : (
      <PolicyCard
        title={`System Hardening — ${role.replace(/_/g, " ")}`}
        editing={editing}
        saving={saving}
        onEdit={startEdit}
        onSave={saveEdit}
        onCancel={() => setEditing(false)}
      >
        {/* Local Admin */}
        <div className="pb-4 mb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-1)" }}>Local Administrator</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <PolicyField
              label="Admin Account Action"
              value={data.local_admin_action ?? "keep"}
              type="select"
              options={adminActionOptions}
              readOnly={!editing}
              onChange={(v) => setForm({ ...form, local_admin_action: String(v) })}
            />
            {(data.local_admin_action === "rename") && (
              <PolicyField
                label="New Admin Name"
                value={data.local_admin_new_name ?? ""}
                type="text"
                readOnly={!editing}
                onChange={(v) => setForm({ ...form, local_admin_new_name: String(v) })}
              />
            )}
          </div>
        </div>

        {/* LAPS */}
        <div className="pb-4 mb-4 border-b" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-1)" }}>LAPS (Local Admin Password Solution)</h3>
          <PolicyToggle
            label="LAPS Enabled"
            value={data.laps_enabled ?? false}
            readOnly={!editing}
            onChange={(v) => setForm({ ...form, laps_enabled: v })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mt-1">
            <PolicyField
              label="Password Length"
              value={data.laps_password_length ?? 14}
              type="number"
              readOnly={!editing}
              suffix="chars"
              onChange={(v) => setForm({ ...form, laps_password_length: Number(v) })}
            />
            <PolicyField
              label="Password Age"
              value={data.laps_password_age_days ?? 30}
              type="number"
              readOnly={!editing}
              suffix="days"
              onChange={(v) => setForm({ ...form, laps_password_age_days: Number(v) })}
            />
            <PolicyField
              label="Password Complexity"
              value={data.laps_password_complexity ?? "letters_digits_special"}
              type="select"
              options={complexityOptions}
              readOnly={!editing}
              onChange={(v) => setForm({ ...form, laps_password_complexity: String(v) })}
            />
          </div>
        </div>

        {/* UAC */}
        <div className="pb-4 mb-4 border-b" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-1)" }}>User Account Control (UAC)</h3>
          <PolicyToggle
            label="UAC Enabled"
            value={data.uac_enabled ?? false}
            readOnly={!editing}
            onChange={(v) => setForm({ ...form, uac_enabled: v })}
          />
          <PolicyField
            label="UAC Level"
            value={data.uac_level ?? "always_notify"}
            type="select"
            options={uacLevelOptions}
            readOnly={!editing}
            onChange={(v) => setForm({ ...form, uac_level: String(v) })}
          />
          <PolicyToggle
            label="Admin Approval Mode"
            value={data.uac_admin_approval_mode ?? false}
            readOnly={!editing}
            onChange={(v) => setForm({ ...form, uac_admin_approval_mode: v })}
          />
          <PolicyToggle
            label="Detect Installations"
            value={data.uac_detect_installations ?? false}
            readOnly={!editing}
            onChange={(v) => setForm({ ...form, uac_detect_installations: v })}
          />
        </div>

        {/* PowerShell */}
        <div className="pb-4 mb-4 border-b" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-1)" }}>PowerShell Logging</h3>
          <PolicyToggle
            label="PowerShell Logging"
            value={data.powershell_logging_enabled ?? false}
            readOnly={!editing}
            onChange={(v) => setForm({ ...form, powershell_logging_enabled: v })}
          />
          <PolicyToggle
            label="Script Block Logging"
            value={data.powershell_script_block_logging ?? false}
            readOnly={!editing}
            onChange={(v) => setForm({ ...form, powershell_script_block_logging: v })}
          />
          <PolicyToggle
            label="Module Logging"
            value={data.powershell_module_logging ?? false}
            readOnly={!editing}
            onChange={(v) => setForm({ ...form, powershell_module_logging: v })}
          />
          <PolicyToggle
            label="Transcription"
            value={data.powershell_transcription_enabled ?? false}
            readOnly={!editing}
            onChange={(v) => setForm({ ...form, powershell_transcription_enabled: v })}
          />
          {data.powershell_transcription_enabled && (
            <PolicyField
              label="Transcription Path"
              value={data.powershell_transcription_path ?? ""}
              type="text"
              readOnly={!editing}
              onChange={(v) => setForm({ ...form, powershell_transcription_path: String(v) })}
            />
          )}
        </div>

        {/* BitLocker */}
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-1)" }}>BitLocker</h3>
          <PolicyToggle
            label="BitLocker Enabled"
            value={data.bitlocker_enabled ?? false}
            readOnly={!editing}
            onChange={(v) => setForm({ ...form, bitlocker_enabled: v })}
          />
          <PolicyToggle
            label="Require TPM"
            value={data.bitlocker_require_tpm ?? false}
            readOnly={!editing}
            onChange={(v) => setForm({ ...form, bitlocker_require_tpm: v })}
          />
          <PolicyField
            label="Encryption Method"
            value={data.bitlocker_encryption_method ?? "xts_aes_128"}
            type="select"
            options={encryptionOptions}
            readOnly={!editing}
            onChange={(v) => setForm({ ...form, bitlocker_encryption_method: String(v) })}
          />
        </div>
      </PolicyCard>
      )}
    </div>
  );
}
