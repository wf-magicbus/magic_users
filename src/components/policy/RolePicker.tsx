"use client";

import { useEffect, useState } from "react";

export type PolicyRole = string;

const SUPER_ADMIN = "super_admin";

function formatLabel(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

interface RolePickerProps {
  active: PolicyRole;
  onChange: (role: PolicyRole) => void;
}

export default function RolePicker({ active, onChange }: RolePickerProps) {
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/policy-roles")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d) && d.length > 0) setRoles(d);
      })
      .catch(() => {});
  }, []);

  const isSuper = active === SUPER_ADMIN;

  return (
    <div className="mb-6 flex items-center gap-3">
      <label className="text-xs font-semibold uppercase tracking-wider flex-shrink-0" style={{ color: "var(--text-3)" }}>
        Role
      </label>
      <div className="relative">
        <select
          value={active}
          onChange={e => onChange(e.target.value)}
          className="appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-semibold cursor-pointer outline-none transition-all"
          style={{
            background: isSuper ? "var(--gold-50)" : "var(--crimson-50)",
            color: isSuper ? "var(--gold-dark)" : "var(--crimson)",
            border: isSuper ? "1px solid var(--gold)" : "1px solid var(--crimson-100)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {roles.length === 0 ? (
            <option value={active}>{formatLabel(active)}</option>
          ) : (
            roles.map(role => (
              <option key={role} value={role}>{formatLabel(role)}</option>
            ))
          )}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
          style={{ color: isSuper ? "var(--gold-dark)" : "var(--crimson)" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
          </svg>
        </span>
      </div>
    </div>
  );
}
