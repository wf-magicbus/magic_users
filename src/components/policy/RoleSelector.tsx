"use client";

import { useEffect, useState } from "react";

interface Props {
  value: string;
  onChange: (role: string) => void;
}

export default function RoleSelector({ value, onChange }: Props) {
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/roles")
      .then((r) => r.json())
      .then((d) => {
        const names = (d.roles ?? []).map((r: { name: string }) => r.name);
        setRoles(names);
        if (!value && names.length > 0) onChange(names[0]);
      });
  }, []);

  if (roles.length === 0) return null;

  return (
    <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
      <label className="text-sm font-medium flex-shrink-0" style={{ color: "var(--text-2)" }}>Role</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-lg text-sm outline-none capitalize"
        style={{
          background: "var(--card-bg, #161b22)",
          border: "1px solid var(--border)",
          color: "var(--text-1, #e6edf3)",
          minWidth: 180,
        }}
      >
        <option value="">Select a role…</option>
        {roles.map((r) => (
          <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
        ))}
      </select>
    </div>
  );
}
