export const mockPasswordPolicy = {
  id: "pp-001",
  role: "all_users",
  min_password_length: 12,
  require_uppercase: true,
  require_lowercase: true,
  require_digit: true,
  require_special_char: true,
  password_history_depth: 5,
  max_password_age_days: 90,
  min_password_age_days: 1,
  store_reversible_encryption: false,
  updated_at: "2026-02-28T14:00:00Z",
  updated_by: "u-001",
};

export const mockPasswordPolicies = [
  { ...mockPasswordPolicy },
  { ...mockPasswordPolicy, id: "pp-002", role: "super_admin", min_password_length: 14, max_password_age_days: 60 },
  { ...mockPasswordPolicy, id: "pp-003", role: "user_admin", min_password_length: 12 },
  { ...mockPasswordPolicy, id: "pp-004", role: "auditor", min_password_length: 10, max_password_age_days: 120 },
];

export const mockLockoutPolicy = {
  id: "lp-001",
  lockout_duration_minutes: 30,
  lockout_threshold_attempts: 5,
  reset_counter_after_minutes: 15,
  updated_at: "2026-02-28T14:00:00Z",
  updated_by: "u-001",
};

export const mockAdmins = [
  {
    id: "a-001",
    user_id: "u-001",
    name: "Primary Admin",
    email: "admin@company.com",
    role: "super_admin",
    privileges: ["manage_users", "reset_passwords", "unlock_accounts", "edit_policies", "manage_roles", "view_audit_log", "manage_groups", "billing_access"],
    created_at: "2026-01-15T09:30:00Z",
    created_by: "u-001",
  },
  {
    id: "a-002",
    user_id: "u-002",
    name: "Jane Smith",
    email: "jane@company.com",
    role: "user_admin",
    privileges: ["manage_users", "reset_passwords", "unlock_accounts"],
    created_at: "2026-02-01T10:00:00Z",
    created_by: "u-001",
  },
];

export const mockAdminRoles = [
  { id: "r-001", role_name: "super_admin", description: "Full system access", is_dedicated_admin: true, max_members: 3, current_member_count: 1 },
  { id: "r-002", role_name: "user_admin", description: "Manage users and passwords", is_dedicated_admin: false, max_members: 10, current_member_count: 1 },
  { id: "r-003", role_name: "auditor", description: "Read-only audit access", is_dedicated_admin: false, max_members: 0, current_member_count: 0 },
];

export const mockProtectedGroups = [
  { id: "g-001", group_name: "super_admins", description: "Highest privilege group", member_count: 1 },
  { id: "g-002", group_name: "billing_admins", description: "Billing management group", member_count: 2 },
];

export const mockUsers = [
  { id: "u-001", name: "Alice Chen", email: "alice@company.com", status: "active", role: "super_admin", last_login: "2026-02-28T14:32:00Z", mfa_enabled: true },
  { id: "u-002", name: "Bob Johnson", email: "bob@company.com", status: "active", role: "user_admin", last_login: "2026-02-27T09:15:00Z", mfa_enabled: true },
  { id: "u-003", name: "Carol Williams", email: "carol@company.com", status: "locked", role: null, last_login: "2026-02-25T11:45:00Z", mfa_enabled: false },
  { id: "u-004", name: "David Lee", email: "david@company.com", status: "active", role: null, last_login: "2026-02-28T08:00:00Z", mfa_enabled: true },
  { id: "u-005", name: "Eve Martinez", email: "eve@company.com", status: "disabled", role: null, last_login: "2026-01-15T16:20:00Z", mfa_enabled: false },
  { id: "u-006", name: "Frank Brown", email: "frank@company.com", status: "active", role: "auditor", last_login: "2026-02-28T12:10:00Z", mfa_enabled: true },
];

export const mockUserDetail = {
  id: "u-001",
  name: "Alice Chen",
  email: "alice@company.com",
  status: "active",
  role: "super_admin",
  last_login: "2026-02-28T14:32:00Z",
  mfa_enabled: true,
  password_last_changed: "2026-02-01",
  password_expires_at: "2026-05-02",
  must_change_password: false,
  failed_attempts: 0,
  is_locked: false,
  privileges: ["manage_users", "reset_passwords", "unlock_accounts"],
};

export const mockSessions = [
  { id: "s-001", user_id: "u-001", user_name: "Alice Chen", user_email: "alice@company.com", ip_address: "10.0.1.42", device: "Chrome / macOS", location: "San Francisco, US", started_at: "2026-02-28T14:32:00Z", is_active: true },
  { id: "s-002", user_id: "u-002", user_name: "Bob Johnson", user_email: "bob@company.com", ip_address: "10.0.1.55", device: "Firefox / Windows", location: "New York, US", started_at: "2026-02-28T09:15:00Z", is_active: true },
  { id: "s-003", user_id: "u-004", user_name: "David Lee", user_email: "david@company.com", ip_address: "10.0.2.10", device: "Safari / macOS", location: "Austin, US", started_at: "2026-02-28T08:00:00Z", is_active: true },
];

export const mockLoginHistory = [
  { id: "lh-001", user_id: "u-001", timestamp: "2026-02-28T14:32:00Z", success: true, ip_address: "10.0.1.42", device: "Chrome / macOS" },
  { id: "lh-002", user_id: "u-001", timestamp: "2026-02-27T09:00:00Z", success: true, ip_address: "10.0.1.42", device: "Chrome / macOS" },
  { id: "lh-003", user_id: "u-001", timestamp: "2026-02-26T08:45:00Z", success: false, ip_address: "192.168.1.100", device: "Unknown" },
];

export const mockAccessLog = [
  { id: "al-001", user_id: "u-002", user_name: "Bob Johnson", action: "granted", item: "manage_users", performed_by: "u-001", performed_by_name: "Alice Chen", timestamp: "2026-02-20T10:00:00Z" },
  { id: "al-002", user_id: "u-002", user_name: "Bob Johnson", action: "granted", item: "reset_passwords", performed_by: "u-001", performed_by_name: "Alice Chen", timestamp: "2026-02-20T10:01:00Z" },
  { id: "al-003", user_id: "u-005", user_name: "Eve Martinez", action: "revoked", item: "billing_access", performed_by: "u-001", performed_by_name: "Alice Chen", timestamp: "2026-02-15T14:30:00Z" },
  { id: "al-004", user_id: "u-006", user_name: "Frank Brown", action: "granted", item: "view_audit_log", performed_by: "u-001", performed_by_name: "Alice Chen", timestamp: "2026-02-10T09:00:00Z" },
];

export const privilegesCatalog = [
  { key: "manage_users", label: "Manage Users", hint: "Create, edit, delete user accounts" },
  { key: "reset_passwords", label: "Reset Passwords", hint: "Force password resets for users" },
  { key: "unlock_accounts", label: "Unlock Accounts", hint: "Unlock locked-out accounts" },
  { key: "edit_policies", label: "Edit Policies", hint: "Modify password & lockout policies" },
  { key: "manage_roles", label: "Manage Roles", hint: "Assign and revoke admin roles" },
  { key: "view_audit_log", label: "View Audit Log", hint: "Read-only access to audit trail" },
  { key: "manage_groups", label: "Manage Protected Groups", hint: "Add/remove protected group members" },
  { key: "billing_access", label: "Billing Access", hint: "View and manage billing" },
];
