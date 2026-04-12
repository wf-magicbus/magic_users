"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { createClient } from "@/lib/supabase/client";

const tabs = ["👤 Admin Accounts", "🛡️ Admin Roles", "📁 Protected Groups"] as const;
type Tab = (typeof tabs)[number];

interface Admin {
  id: string;
  name: string;
  email: string;
  role_id?: string;
  created_at: string;
}

interface AdminRole {
  id: string;
  role_name: string;
  description: string;
  is_dedicated_admin: boolean;
  max_members: number;
  current_member_count?: number;
}

interface ProtectedGroup {
  id: string;
  group_name: string;
  description: string;
  member_count: number;
  members?: ProtectedGroupMember[];
  created_at?: string;
  updated_at?: string;
}

interface ProtectedGroupMember {
  user_id: string;
  name: string;
  email: string;
  status: "active" | "locked" | "disabled";
  role: string | null;
}

interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  status: "active" | "locked" | "disabled";
  role: string | null;
}

export default function AdministrationPage() {
  const { loading } = useAuthGuard();
  const [activeTab, setActiveTab] = useState<Tab>("👤 Admin Accounts");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [protectedGroups, setProtectedGroups] = useState<ProtectedGroup[]>([]);
  const [editData, setEditData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState<DirectoryUser[]>([]);

  const supabase = createClient();

  const fetchAdmins = useCallback(async () => {
    try {
      setError(null);
      const { data, error: err } = await supabase.from("admin_accounts").select("*");
      if (err) throw err;
      setAdmins(data || []);
    } catch (err: any) {
      setError(err.message);
      setAdmins([]);
    }
  }, [supabase]);

  const fetchAdminRoles = useCallback(async () => {
    try {
      setError(null);
      const { data, error: err } = await supabase.from("admin_roles").select("*");
      if (err) throw err;
      setAdminRoles(data || []);
    } catch (err: any) {
      setError(err.message);
      setAdminRoles([]);
    }
  }, [supabase]);

  const fetchProtectedGroups = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/protected-groups");
      if (!response.ok) throw new Error("Failed to fetch protected groups");
      const data = await response.json();
      setProtectedGroups(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
      setProtectedGroups([]);
    }
  }, []);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users?limit=200");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setAvailableUsers(Array.isArray(data?.users) ? data.users : []);
    } catch {
      setAvailableUsers([]);
    }
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      setLoadingData(true);
      await Promise.all([fetchAdmins(), fetchAdminRoles(), fetchProtectedGroups(), fetchAvailableUsers()]);
      setLoadingData(false);
    };
    loadAllData();
  }, [fetchAdmins, fetchAdminRoles, fetchProtectedGroups, fetchAvailableUsers]);

  if (loading || loadingData) {
    return <div className="text-gray-500 text-center py-8">Loading...</div>;
  }

  const filteredAdmins = admins.filter(a =>
    a.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const filteredRoles = adminRoles.filter(r =>
    r.role_name.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const filteredGroups = protectedGroups.filter((group) =>
    group.group_name.toLowerCase().includes(groupSearch.toLowerCase()) ||
    (group.description || "").toLowerCase().includes(groupSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffefb] to-[#fff8e8]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-400 text-white font-bold shadow-sm">A</div>
            <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          </div>
          <p className="text-gray-600">Manage admin accounts, roles, and protected groups</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-1 p-1 rounded-lg w-fit mb-8 bg-white border border-gray-200 shadow-sm flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab
                  ? "bg-yellow-400 text-white"
                  : "text-gray-700 hover:bg-yellow-50"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "👤 Admin Accounts" && (
          <AdminAccountsTab
            admins={filteredAdmins}
            allAdmins={admins}
            search={adminSearch}
            setSearch={setAdminSearch}
            onEdit={setEditData}
            onRefresh={fetchAdmins}
          />
        )}
        {activeTab === "🛡️ Admin Roles" && (
          <AdminRolesTab
            roles={filteredRoles}
            allRoles={adminRoles}
            search={roleSearch}
            setSearch={setRoleSearch}
            onEdit={setEditData}
            onRefresh={fetchAdminRoles}
          />
        )}
        {activeTab === "📁 Protected Groups" && (
          <ProtectedGroupsTab
            groups={filteredGroups}
            allGroups={protectedGroups}
            search={groupSearch}
            setSearch={setGroupSearch}
            onEdit={setEditData}
            onRefresh={fetchProtectedGroups}
          />
        )}
      </div>

      {/* Edit Modal */}
      {editData && (
        <EditModal
          data={editData}
          availableUsers={availableUsers}
          adminRoles={adminRoles}
          onClose={() => setEditData(null)}
          onRefresh={editData.type === "admin" ? fetchAdmins : editData.type === "role" ? fetchAdminRoles : fetchProtectedGroups}
        />
      )}
    </div>
  );
}

function AdminAccountsTab({ admins, allAdmins, search, setSearch, onEdit, onRefresh }: any) {
  const supabase = createClient();

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    try {
      const { error: err } = await supabase.from("admin_accounts").delete().eq("id", adminId);
      if (err) throw err;
      onRefresh();
    } catch (err: any) {
      alert("Error deleting admin: " + err.message);
    }
  };

  const adminCount = allAdmins.length;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Admin Accounts</h2>
        <p className="text-sm text-gray-600">Manage administrative user accounts and their privileges</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button className="px-6 py-2 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors shadow-sm" onClick={() => onEdit({ type: "admin", id: null })}>
          Add Admin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-700">Total Admins</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{adminCount}</div>
          <div className="text-xs text-gray-500 mt-1">All administrative accounts</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-700">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-2">{adminCount}</div>
          <div className="text-xs text-gray-500 mt-1">Currently active admins</div>
        </div>
      </div>

      {admins.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">👤</div>
          <div className="text-lg font-semibold text-gray-900 mb-2">No admins found</div>
          <div className="text-gray-600">Try adjusting your search filter</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-yellow-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Created</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin: any) => (
                <tr key={admin.id} className="border-b border-gray-100 hover:bg-yellow-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{admin.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(admin.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      <button className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded hover:bg-yellow-100 border border-yellow-200 transition-colors" onClick={() => onEdit({ type: "admin", ...admin })}>
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded hover:bg-red-100 border border-red-200 transition-colors" onClick={() => handleDeleteAdmin(admin.id)}>
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
    </div>
  );
}

function AdminRolesTab({ roles, allRoles, search, setSearch, onEdit, onRefresh }: any) {
  const supabase = createClient();

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      const { error: err } = await supabase.from("admin_roles").delete().eq("id", roleId);
      if (err) throw err;
      onRefresh();
    } catch (err: any) {
      alert("Error deleting role: " + err.message);
    }
  };

  const totalRoles = allRoles.length;
  const dedicatedRoles = allRoles.filter((r: any) => r.is_dedicated_admin).length;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Admin Roles</h2>
        <p className="text-sm text-gray-600">Create and manage admin roles with configurable permissions</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by role name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button className="px-6 py-2 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors shadow-sm" onClick={() => onEdit({ type: "role", id: null })}>
          Add Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-700">Total Roles</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{totalRoles}</div>
          <div className="text-xs text-gray-500 mt-1">Configured administrative roles</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-700">Dedicated Admin</div>
          <div className="text-2xl font-bold text-green-600 mt-2">{dedicatedRoles}</div>
          <div className="text-xs text-gray-500 mt-1">Roles reserved for specific admins</div>
        </div>
      </div>

      {roles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <div className="text-lg font-semibold text-gray-900 mb-2">No roles found</div>
          <div className="text-gray-600">Try adjusting your search filter</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-yellow-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Role Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Description</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Type</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Members</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role: any) => (
                <tr key={role.id} className="border-b border-gray-100 hover:bg-yellow-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{role.role_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{role.description || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${role.is_dedicated_admin ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"}`}>
                      {role.is_dedicated_admin ? "Dedicated" : "Shared"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {role.current_member_count ?? 0} / {role.max_members === 0 ? "∞" : role.max_members}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      <button className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded hover:bg-yellow-100 border border-yellow-200 transition-colors" onClick={() => onEdit({ type: "role", ...role })}>
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded hover:bg-red-100 border border-red-200 transition-colors" onClick={() => handleDeleteRole(role.id)}>
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
    </div>
  );
}

function ProtectedGroupsTab({ groups, allGroups, search, setSearch, onEdit, onRefresh }: any) {
  const memberCount = allGroups.reduce((sum: number, g: any) => sum + (g.member_count || 0), 0);

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this protected group?")) return;

    try {
      const response = await fetch(`/api/protected-groups/${groupId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete protected group");
      onRefresh();
    } catch (err: any) {
      alert("Error deleting group: " + err.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Protected Groups</h2>
        <p className="text-sm text-gray-600">Create protected groups and manage their assigned members</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by group name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button
          className="px-6 py-2 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors shadow-sm"
          onClick={() => onEdit({ type: "protectedGroup", id: null, group_name: "", description: "", member_ids: [] })}
        >
          Add Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-700">Total Groups</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{allGroups.length}</div>
          <div className="text-xs text-gray-500 mt-1">Protected groups in the directory</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-700">Total Members</div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{memberCount}</div>
          <div className="text-xs text-gray-500 mt-1">Assigned protected group members</div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">📁</div>
          <div className="text-lg font-semibold text-gray-900 mb-2">No protected groups found</div>
          <div className="text-gray-600">Try adjusting your search filter or add a new group</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-yellow-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Group Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Description</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Members</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group: any) => (
                <tr key={group.id} className="border-b border-gray-100 hover:bg-yellow-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{group.group_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{group.description || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-semibold">{group.member_count}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded hover:bg-yellow-100 border border-yellow-200 transition-colors"
                        onClick={() => onEdit({
                          type: "protectedGroup",
                          ...group,
                          member_ids: Array.isArray(group.members) ? group.members.map((member: any) => member.user_id) : [],
                        })}
                      >
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded hover:bg-red-100 border border-red-200 transition-colors" onClick={() => handleDeleteGroup(group.id)}>
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
    </div>
  );
}

function EditModal({ data, availableUsers, adminRoles, onClose, onRefresh }: any) {
  const [formData, setFormData] = useState(data);
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const supabase = createClient();

  const filteredAvailableUsers = availableUsers.filter((user: DirectoryUser) =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleSave = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (data.type === "admin") {
        const payload = { name: formData.name, email: formData.email, role_id: formData.role_id || null };
        if (data.id) {
          const { error } = await supabase.from("admin_accounts").update(payload).eq("id", data.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("admin_accounts").insert([payload]);
          if (error) throw error;
        }
      } else if (data.type === "role") {
        if (data.id) {
          const { error } = await supabase.from("admin_roles").update(formData).eq("id", data.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("admin_roles").insert([formData]);
          if (error) throw error;
        }
      } else if (data.type === "protectedGroup") {
        const response = await fetch(data.id ? `/api/protected-groups/${data.id}` : "/api/protected-groups", {
          method: data.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            group_name: formData.group_name,
            description: formData.description,
            members: formData.member_ids || [],
          }),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error || "Failed to save protected group");
        }
      }
      onRefresh();
      onClose();
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 w-full ${data.type === "protectedGroup" ? "max-w-2xl" : "max-w-xl"}`} onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">
            {data.type === "admin"
              ? (data.id ? "Edit Admin" : "Add Admin")
              : data.type === "role"
                ? (data.id ? "Edit Role" : "Add Role")
                : (data.id ? "Edit Group" : "Add Group")}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {data.type === "admin" ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Type *</label>
                <select
                  value={formData.role_id || ""}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                >
                  <option value="">— Select admin type —</option>
                  {(adminRoles || []).filter((role: AdminRole) => role.role_name !== "student").map((role: AdminRole) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      {role.description ? ` — ${role.description}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : data.type === "role" ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role Name *</label>
                <input
                  type="text"
                  value={formData.role_name || ""}
                  onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.is_dedicated_admin || false}
                  onChange={(e) => setFormData({ ...formData, is_dedicated_admin: e.target.checked })}
                  className="w-[18px] h-[18px] cursor-pointer accent-yellow-400"
                />
                <label className="text-sm font-medium text-gray-900 cursor-pointer">Dedicated Admin Role</label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Members</label>
                <input
                  type="number"
                  value={formData.max_members || 0}
                  onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  min="0"
                />
                <div className="text-xs text-gray-500 mt-1">0 means unlimited</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name *</label>
                <input
                  type="text"
                  value={formData.group_name || ""}
                  onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Members</label>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-3"
                />
                <div className="max-h-[220px] overflow-y-auto border border-gray-200 rounded-lg p-2 bg-yellow-50/40">
                  {filteredAvailableUsers.length === 0 ? (
                    <div className="text-sm text-gray-500 p-2">No users available</div>
                  ) : (
                    filteredAvailableUsers.map((user: DirectoryUser) => {
                      const selected = Array.isArray(formData.member_ids) && formData.member_ids.includes(user.id);

                      return (
                        <label key={user.id} className="flex items-start gap-3 p-3 border-b border-gray-200 cursor-pointer hover:bg-white rounded-md">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              const currentMembers = Array.isArray(formData.member_ids) ? formData.member_ids : [];
                              const nextMembers = e.target.checked
                                ? [...currentMembers, user.id]
                                : currentMembers.filter((memberId: string) => memberId !== user.id);
                              setFormData({ ...formData, member_ids: nextMembers });
                            }}
                            className="mt-1 w-4 h-4 accent-yellow-400"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-gray-900">{user.name}</span>
                            <span className="block text-xs text-gray-500">{user.email}</span>
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Selected members: {Array.isArray(formData.member_ids) ? formData.member_ids.length : 0}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200 flex-wrap">
            <button type="submit" className="flex-1 px-4 py-2 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button type="button" className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
