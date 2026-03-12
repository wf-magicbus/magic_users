"use client";

import { useState } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { mockPasswordPolicies, mockLockoutPolicy } from "@/lib/mock-data";

const tabs = ["Password Policy", "Lockout Policy"] as const;
type Tab = (typeof tabs)[number];

export default function PoliciesPage() {
  const { loading } = useAuthGuard();
  const [activeTab, setActiveTab] = useState<Tab>("Password Policy");

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Policies</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Password Policy" && <PasswordPolicyTab />}
      {activeTab === "Lockout Policy" && <LockoutPolicyTab />}
    </div>
  );
}

function PasswordPolicyTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {mockPasswordPolicies.map((policy) => (
        <div key={policy.id} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {policy.role.replace(/_/g, " ")}
            </h2>
            <button className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded hover:bg-blue-100 transition-colors">
              Edit
            </button>
          </div>
          <div className="space-y-2 text-sm">
            {[
              ["Min Password Length", policy.min_password_length],
              ["Require Uppercase", policy.require_uppercase],
              ["Require Lowercase", policy.require_lowercase],
              ["Require Digit", policy.require_digit],
              ["Require Special Char", policy.require_special_char],
              ["Password History Depth", policy.password_history_depth],
              ["Max Password Age (days)", policy.max_password_age_days],
              ["Min Password Age (days)", policy.min_password_age_days],
              ["Reversible Encryption", policy.store_reversible_encryption],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between">
                <span className="text-gray-500">{String(label)}</span>
                {typeof value === "boolean" ? (
                  <span className={`font-medium ${value ? (String(label) === "Reversible Encryption" ? "text-red-600" : "text-green-600") : "text-gray-400"}`}>
                    {value ? "Yes" : "No"}
                  </span>
                ) : (
                  <span className="font-medium text-gray-900">{String(value)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LockoutPolicyTab() {
  const policy = mockLockoutPolicy;
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Current Policy</h2>
        <button className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded hover:bg-blue-100 transition-colors">
          Edit
        </button>
      </div>
      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Lockout Duration (minutes)</span>
          <span className="font-medium text-gray-900">{policy.lockout_duration_minutes}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Lockout Threshold (attempts)</span>
          <span className="font-medium text-gray-900">{policy.lockout_threshold_attempts}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Reset Counter After (minutes)</span>
          <span className="font-medium text-gray-900">{policy.reset_counter_after_minutes}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Updated At</span>
          <span className="font-medium text-gray-900">{new Date(policy.updated_at).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
