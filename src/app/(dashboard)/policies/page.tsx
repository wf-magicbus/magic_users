"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";

const tabs = ["Password Policy", "Lockout Policy"] as const;
type Tab = (typeof tabs)[number];

interface PasswordPolicy {
  id: string;
  role: string;
  min_password_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_digit: boolean;
  require_special_char: boolean;
  password_history_depth: number;
  max_password_age_days: number;
  min_password_age_days: number;
  store_reversible_encryption: boolean;
  updated_at?: string;
  updated_by?: string;
}

interface LockoutPolicy {
  id: string;
  lockout_duration_minutes: number;
  lockout_threshold_attempts: number;
  reset_counter_after_minutes: number;
  updated_at?: string;
  updated_by?: string;
}

export default function PoliciesPage() {
  const { loading } = useAuthGuard();
  const [activeTab, setActiveTab] = useState<Tab>("Password Policy");
  const [passwordPolicies, setPasswordPolicies] = useState<PasswordPolicy[]>([]);
  const [lockoutPolicy, setLockoutPolicy] = useState<LockoutPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch password policies
  const fetchPasswordPolicies = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/password-policy");
      if (!response.ok) throw new Error("Failed to fetch password policies");
      const data = await response.json();
      setPasswordPolicies(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPasswordPolicies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch lockout policy
  const fetchLockoutPolicy = useCallback(async () => {
    try {
      const response = await fetch("/api/lockout-policy");
      if (!response.ok) throw new Error("Failed to fetch lockout policy");
      const data = await response.json();
      setLockoutPolicy(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchPasswordPolicies();
      fetchLockoutPolicy();
    }
  }, [loading, fetchPasswordPolicies, fetchLockoutPolicy]);

  if (loading || isLoading) return <div className="text-gray-500 text-center py-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffefb] to-[#fff8e8]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Policies</h1>
          <p className="text-gray-600">Manage password and account lockout policies</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="inline-flex gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded font-medium text-sm transition-colors ${activeTab === tab
                ? "bg-yellow-400 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Password Policy" && (
          <PasswordPolicyTab
            policies={passwordPolicies}
            onRefresh={fetchPasswordPolicies}
            isLoading={isLoading}
          />
        )}
        {activeTab === "Lockout Policy" && (
          <LockoutPolicyTab
            policy={lockoutPolicy}
            onRefresh={fetchLockoutPolicy}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

function PasswordPolicyTab({
  policies,
  onRefresh,
  isLoading
}: {
  policies: PasswordPolicy[];
  onRefresh: () => void;
  isLoading: boolean;
}) {
  const [editingPolicy, setEditingPolicy] = useState<PasswordPolicy | null>(null);

  if (policies.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Policies Found</h3>
        <p className="text-gray-600">Password policies are not available at this time.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {policies.map((policy) => (
          <div key={policy.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 capitalize mb-1">
                  {policy.role.replace(/_/g, " ")}
                </h2>
                <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                  {policy.role}
                </span>
              </div>
              <button
                onClick={() => setEditingPolicy(policy)}
                className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded hover:bg-yellow-100 transition-colors border border-yellow-200"
              >
                Edit
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["Min Password Length", policy.min_password_length, "characters"],
                ["Require Uppercase", policy.require_uppercase, null],
                ["Require Lowercase", policy.require_lowercase, null],
                ["Require Digit", policy.require_digit, null],
                ["Require Special Char", policy.require_special_char, null],
                ["Password History Depth", policy.password_history_depth, "passwords"],
                ["Max Password Age", policy.max_password_age_days, "days"],
                ["Min Password Age", policy.min_password_age_days, "days"],
                ["Reversible Encryption", policy.store_reversible_encryption, null],
              ].map(([label, value, unit]) => (
                <div key={String(label)} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-600 font-medium">{String(label)}</span>
                  {typeof value === "boolean" ? (
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${value ? "bg-green-500" : "bg-red-500"}`}></span>
                      <span className={`font-semibold ${value ? "text-green-700" : "text-red-700"}`}>
                        {value ? "Yes" : "No"}
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold text-gray-900">
                      {String(value)} {unit && <span className="text-gray-500 font-normal">{unit}</span>}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {policy.updated_at && (
              <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                Last updated: {new Date(policy.updated_at).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {editingPolicy && (
        <PasswordPolicyModal
          policy={editingPolicy}
          onClose={() => setEditingPolicy(null)}
          onSave={async (updatedPolicy) => {
            try {
              const response = await fetch(`/api/password-policy/${editingPolicy.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedPolicy),
              });
              if (!response.ok) throw new Error("Failed to update policy");
              setEditingPolicy(null);
              onRefresh();
            } catch (err) {
              alert(err instanceof Error ? err.message : "Update failed");
            }
          }}
        />
      )}
    </>
  );
}

function LockoutPolicyTab({
  policy,
  onRefresh,
  isLoading
}: {
  policy: LockoutPolicy | null;
  onRefresh: () => void;
  isLoading: boolean;
}) {
  const [editingPolicy, setEditingPolicy] = useState<LockoutPolicy | null>(null);

  if (!policy) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Policy Found</h3>
        <p className="text-gray-600">Lockout policy is not available at this time.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Current Lockout Policy</h2>
            <p className="text-gray-600 text-sm mt-1">System-wide account lockout configuration</p>
          </div>
          <button
            onClick={() => setEditingPolicy(policy)}
            className="px-4 py-2 bg-yellow-400 text-white text-sm font-semibold rounded-lg hover:bg-yellow-500 transition-colors shadow-sm"
          >
            Edit Policy
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700">Lockout Duration</p>
              <p className="text-xs text-gray-600 mt-1">How long an account stays locked</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{policy.lockout_duration_minutes}</p>
              <p className="text-xs text-gray-600">minutes</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700">Lockout Threshold</p>
              <p className="text-xs text-gray-600 mt-1">Failed attempts before lockout</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{policy.lockout_threshold_attempts}</p>
              <p className="text-xs text-gray-600">attempts</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700">Reset Counter After</p>
              <p className="text-xs text-gray-600 mt-1">Time to reset failed attempt counter</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{policy.reset_counter_after_minutes}</p>
              <p className="text-xs text-gray-600">minutes</p>
            </div>
          </div>
        </div>

        {policy.updated_at && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(policy.updated_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {editingPolicy && (
        <LockoutPolicyModal
          policy={editingPolicy}
          onClose={() => setEditingPolicy(null)}
          onSave={async (updatedPolicy) => {
            try {
              const response = await fetch(`/api/lockout-policy/${editingPolicy.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedPolicy),
              });
              if (!response.ok) throw new Error("Failed to update policy");
              setEditingPolicy(null);
              onRefresh();
            } catch (err) {
              alert(err instanceof Error ? err.message : "Update failed");
            }
          }}
        />
      )}
    </>
  );
}

// Modal Components
interface PasswordPolicyModalProps {
  policy: PasswordPolicy;
  onClose: () => void;
  onSave: (policy: PasswordPolicy) => void;
}

function PasswordPolicyModal({ policy, onClose, onSave }: PasswordPolicyModalProps) {
  const [formData, setFormData] = useState(policy);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Password Policy</h2>
            <p className="text-gray-600 text-sm mt-1 capitalize">{policy.role.replace(/_/g, " ")}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min Password Length
              </label>
              <input
                type="number"
                min="1"
                value={formData.min_password_length}
                onChange={(e) => handleChange('min_password_length', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password History Depth
              </label>
              <input
                type="number"
                min="0"
                value={formData.password_history_depth}
                onChange={(e) => handleChange('password_history_depth', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Password Age (days)
              </label>
              <input
                type="number"
                min="0"
                value={formData.max_password_age_days}
                onChange={(e) => handleChange('max_password_age_days', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min Password Age (days)
              </label>
              <input
                type="number"
                min="0"
                value={formData.min_password_age_days}
                onChange={(e) => handleChange('min_password_age_days', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_uppercase}
                onChange={(e) => handleChange('require_uppercase', e.target.checked)}
                className="w-4 h-4 text-yellow-400 rounded"
              />
              <span className="text-gray-700 font-medium">Require Uppercase</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_lowercase}
                onChange={(e) => handleChange('require_lowercase', e.target.checked)}
                className="w-4 h-4 text-yellow-400 rounded"
              />
              <span className="text-gray-700 font-medium">Require Lowercase</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_digit}
                onChange={(e) => handleChange('require_digit', e.target.checked)}
                className="w-4 h-4 text-yellow-400 rounded"
              />
              <span className="text-gray-700 font-medium">Require Digit</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_special_char}
                onChange={(e) => handleChange('require_special_char', e.target.checked)}
                className="w-4 h-4 text-yellow-400 rounded"
              />
              <span className="text-gray-700 font-medium">Require Special Character</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.store_reversible_encryption}
                onChange={(e) => handleChange('store_reversible_encryption', e.target.checked)}
                className="w-4 h-4 text-yellow-400 rounded"
              />
              <span className="text-gray-700 font-medium">Store Reversible Encryption</span>
            </label>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface LockoutPolicyModalProps {
  policy: LockoutPolicy;
  onClose: () => void;
  onSave: (policy: LockoutPolicy) => void;
}

function LockoutPolicyModal({ policy, onClose, onSave }: LockoutPolicyModalProps) {
  const [formData, setFormData] = useState(policy);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Lockout Policy</h2>
            <p className="text-gray-600 text-sm mt-1">System-wide account lockout configuration</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lockout Duration (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={formData.lockout_duration_minutes}
              onChange={(e) => handleChange('lockout_duration_minutes', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
            />
            <p className="text-xs text-gray-500 mt-2">How long an account stays locked after exceeding failed attempts</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lockout Threshold (attempts)
            </label>
            <input
              type="number"
              min="1"
              value={formData.lockout_threshold_attempts}
              onChange={(e) => handleChange('lockout_threshold_attempts', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
            />
            <p className="text-xs text-gray-500 mt-2">Number of failed login attempts before account lockout</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reset Counter After (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={formData.reset_counter_after_minutes}
              onChange={(e) => handleChange('reset_counter_after_minutes', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
            />
            <p className="text-xs text-gray-500 mt-2">Time after which failed login counter resets</p>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
