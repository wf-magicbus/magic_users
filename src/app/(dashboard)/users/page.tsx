"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "locked" | "disabled";
  role: string | null;
  last_login: string | null;
  failed_attempts?: number;
}

interface RoleApiItem {
  name: string;
}

type UserSavePayload = Partial<User> & { password?: string };

export default function UsersPage() {
  const { loading: authLoading } = useAuthGuard();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [adminsCount, setAdminsCount] = useState<number | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchUsers();
      fetch("/api/admins")
        .then((r) => r.json())
        .then((d) => setAdminsCount(d.admins?.length ?? d.length ?? 0))
        .catch(() => setAdminsCount(0));

      fetch("/api/roles")
        .then((r) => r.json())
        .then((d) => {
          const roleNames = Array.isArray(d?.roles)
            ? d.roles
              .map((role: RoleApiItem) => role?.name)
              .filter((name: unknown): name is string => typeof name === "string" && name.length > 0)
            : [];
          setAvailableRoles(roleNames);
        })
        .catch(() => setAvailableRoles([]));
    }
  }, [authLoading, fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, search, filterRole]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(users.map((u) => u.role).filter(Boolean) as string[]);
    return Array.from(roles);
  }, [users]);

  const handleSaveUser = async (userData: UserSavePayload) => {
    try {
      const method = editingUser ? "PUT" : "POST";
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Failed to save user");

      setEditingUser(null);
      setIsCreating(false);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete user");
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const activeCount = users.filter((u) => u.status === "active").length;
  const lockedCount = users.filter((u) => u.status === "locked").length;

  if (authLoading || isLoading) {
    return <div className="text-gray-500 text-center py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffefb] to-[#fff8e8]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts and access control</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-700">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{users.length}</p>
            <p className="text-xs text-gray-500 mt-1">All registered users</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-700">Admin Users</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">{adminsCount ?? "-"}</p>
            <p className="text-xs text-gray-500 mt-1">System administrators</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-700">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{activeCount}</p>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-700">Locked</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{lockedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Account locked</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setIsCreating(true);
                setEditingUser(null);
              }}
              className="px-6 py-2 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors shadow-sm"
            >
              + Add User
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found</p>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-yellow-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Last Login</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-yellow-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{user.name}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <code className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold">
                        {user.role || "—"}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${user.status === "active"
                          ? "bg-green-100 text-green-700"
                          : user.status === "locked"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${user.status === "active"
                            ? "bg-green-500"
                            : user.status === "locked"
                              ? "bg-red-500"
                              : "bg-gray-500"
                            }`}
                        ></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded hover:bg-yellow-100 border border-yellow-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded hover:bg-red-100 border border-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modals */}
        {(editingUser || isCreating) && (
          <UserModal
            user={editingUser}
            availableRoles={availableRoles}
            onClose={() => {
              setEditingUser(null);
              setIsCreating(false);
            }}
            onSave={handleSaveUser}
          />
        )}
      </div>
    </div>
  );
}

interface UserModalProps {
  user: User | null;
  availableRoles: string[];
  onClose: () => void;
  onSave: (data: UserSavePayload) => Promise<void>;
}

function UserModal({ user, availableRoles, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "",
    status: user?.status || "active",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: UserSavePayload = { ...formData };

      if (user) {
        delete payload.email;
        if (!payload.password || payload.password.trim() === "") {
          delete payload.password;
        }
      }

      await onSave(payload);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user ? "Edit User" : "Add User"}</h2>
            <p className="text-gray-600 text-sm mt-1">
              {user ? `Editing ${user.name}` : "Create a new user account"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={!!user}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 ${user
                  ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "border-gray-300"
                }`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password {user ? "(optional for edit)" : ""}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required={!user}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select role</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
                {formData.role && !availableRoles.includes(formData.role) && (
                  <option value={formData.role}>{formData.role}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="active">Active</option>
                <option value="locked">Locked</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save User"}
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
