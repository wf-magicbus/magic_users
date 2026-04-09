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
      const { data, error: err } = await supabase.from("protected_groups").select("*");
      if (err) throw err;
      setProtectedGroups(data || []);
    } catch (err: any) {
      setError(err.message);
      setProtectedGroups([]);
    }
  }, [supabase]);

  useEffect(() => {
    const loadAllData = async () => {
      setLoadingData(true);
      await Promise.all([fetchAdmins(), fetchAdminRoles(), fetchProtectedGroups()]);
      setLoadingData(false);
    };
    loadAllData();
  }, [fetchAdmins, fetchAdminRoles, fetchProtectedGroups]);

  if (loading) return <div className="text-gray-500">Loading...</div>;

  const filteredAdmins = admins.filter(a =>
    a.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const filteredRoles = adminRoles.filter(r =>
    r.role_name.toLowerCase().includes(roleSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #fffefb 0%, #fff8e8 100%)" }}>
      <style>{`
        .golden-header { background: linear-gradient(135deg, #f4c430, #d4a017); }
        .stat-card { background: #fffaf0; border: 1px solid rgba(244, 196, 48, 0.18); }
        .tab-button { transition: all 0.2s ease; }
        .tab-button:hover { background: rgba(244, 196, 48, 0.12); }
        .tab-button.active { background: #f4c430; color: #ffffff; }
        .form-input { border: 1px solid rgba(180, 145, 32, 0.22); transition: all 0.2s ease; background: white; }
        .form-input:focus { outline: none; border-color: #f4c430; box-shadow: 0 0 0 3px rgba(244, 196, 48, 0.22); }
        .btn-primary { background: #f4c430; color: #ffffff; transition: all 0.2s ease; }
        .btn-primary:hover:not(:disabled) { background: #e0b020; transform: translateY(-1px); }
        .btn-danger { background: #d64545; color: white; }
        .btn-danger:hover:not(:disabled) { opacity: 0.92; }
        .btn-secondary { background: #fff6d4; color: #2f2a1f; border: 1px solid rgba(212, 160, 23, 0.2); }
        .btn-secondary:hover:not(:disabled) { background: #ffefb5; }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
        .status-active { background: rgba(46, 158, 91, 0.10); color: #2e9e5b; border: 1px solid rgba(46, 158, 91, 0.18); }
        .data-table thead { background: #fff7da; }
        .data-table td { border-bottom: 1px solid rgba(180, 145, 32, 0.10); }
        .data-table tbody tr:hover { background: #fffdf1; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(71, 56, 8, 0.28); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; border-radius: 12px; padding: 28px; max-width: 600px; width: 90%; max-height: 85vh; overflow-y: auto; box-shadow: 0 16px 32px rgba(90, 70, 0, 0.12); border: 1px solid rgba(180, 145, 32, 0.16); }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: "rgba(180, 145, 32, 0.22)" }}>
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="golden-header w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#2f2a1f" }}>Administration</h1>
          </div>
          <p style={{ fontSize: "13px", color: "#6f6653" }}>Manage admin accounts, roles, and protected groups</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="bg-white rounded-lg p-2 shadow-sm mb-8" style={{ border: "1px solid rgba(180, 145, 32, 0.16)" }}>
          <div className="flex gap-1 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="tab-button px-5 py-2 rounded text-sm font-600"
                style={{
                  color: activeTab === tab ? "#ffffff" : "#6f6653",
                  background: activeTab === tab ? "#f4c430" : "transparent"
                }}
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
          <ProtectedGroupsTab groups={protectedGroups} />
        )}
      </div>

      {/* Edit Modal */}
      {editData && <EditModal data={editData} onClose={() => setEditData(null)} onRefresh={editData.type === "admin" ? fetchAdmins : fetchAdminRoles} />}
    </div>
  );
}

function AdminAccountsTab({ admins, allAdmins, search, setSearch, onEdit, onRefresh }: any) {
  const supabase = createClient();

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    try {
      const { error: err } = await supabase.from("admins").delete().eq("id", adminId);
      if (err) throw err;
      onRefresh();
    } catch (err: any) {
      alert("Error deleting admin: " + err.message);
    }
  };

  const adminCount = allAdmins.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-7" style={{ border: "1px solid rgba(180, 145, 32, 0.16)" }}>
      <div className="mb-6 pb-4" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#2f2a1f", marginBottom: "6px" }}>Admin Accounts</h2>
        <p style={{ fontSize: "14px", color: "#6f6653" }}>Manage administrative user accounts and their privileges</p>
      </div>

      {/* Search and Add */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input flex-1 min-w-48 px-3 py-2 rounded text-sm"
          style={{ paddingLeft: "40px", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23b8860b' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "12px center" }}
        />
        <button className="btn-primary px-4 py-2 rounded text-sm font-600" onClick={() => onEdit({ type: "admin", id: null })}>
          Add Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="stat-card rounded p-3">
          <div style={{ fontSize: "12px", color: "#6f6653", fontWeight: "600" }}>Total Admins</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#2f2a1f", marginTop: "4px" }}>{adminCount}</div>
        </div>
        <div className="stat-card rounded p-3">
          <div style={{ fontSize: "12px", color: "#6f6653", fontWeight: "600" }}>Active</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#2f2a1f", marginTop: "4px" }}>{adminCount}</div>
        </div>
      </div>

      {/* Table */}
      {admins.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#6f6653" }}>
          <div style={{ fontSize: "48px", opacity: 0.65, marginBottom: "16px" }}>👤</div>
          <div style={{ fontSize: "16px", color: "#2f2a1f", fontWeight: "600", marginBottom: "8px" }}>No admins found</div>
          <div style={{ fontSize: "14px" }}>Try adjusting your search filter</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid rgba(180, 145, 32, 0.16)" }}>
          <table className="data-table w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fff7da" }}>
                <th className="px-4 py-3 text-left font-700 text-sm" style={{ color: "#2f2a1f", borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>Name</th>
                <th className="px-4 py-3 text-left font-700 text-sm" style={{ color: "#2f2a1f", borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>Email</th>
                <th className="px-4 py-3 text-left font-700 text-sm" style={{ color: "#2f2a1f", borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>Status</th>
                <th className="px-4 py-3 text-left font-700 text-sm" style={{ color: "#2f2a1f", borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>Created</th>
                <th className="px-4 py-3 text-left font-700 text-sm" style={{ color: "#2f2a1f", borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin: any) => (
                <tr key={admin.id} style={{ background: "white" }}>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", fontWeight: "600", color: "#2f2a1f" }}>{admin.name}</td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", color: "#6f6653" }}>{admin.email}</td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)" }}>
                    <span className="status-badge status-active">Active</span>
                  </td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", color: "#6f6653" }}>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)" }}>
                    <div className="flex gap-2 flex-wrap">
                      <button className="btn-secondary px-3 py-1 rounded text-xs font-600" onClick={() => onEdit({ type: "admin", ...admin })}>
                        Edit
                      </button>
                      <button className="btn-danger px-3 py-1 rounded text-xs font-600" onClick={() => handleDeleteAdmin(admin.id)}>
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
    <div className="bg-white rounded-lg shadow-md p-7" style={{ border: "1px solid rgba(180, 145, 32, 0.16)" }}>
      <div className="mb-6 pb-4" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#2f2a1f", marginBottom: "6px" }}>Admin Roles</h2>
        <p style={{ fontSize: "14px", color: "#6f6653" }}>Create and manage admin roles with configurable permissions</p>
      </div>

      {/* Search and Add */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search by role name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input flex-1 min-w-48 px-3 py-2 rounded text-sm"
          style={{ paddingLeft: "40px", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23b8860b' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "12px center" }}
        />
        <button className="btn-primary px-4 py-2 rounded text-sm font-600" onClick={() => onEdit({ type: "role", id: null })}>
          Add Role
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="stat-card rounded p-3">
          <div style={{ fontSize: "12px", color: "#6f6653", fontWeight: "600" }}>Total Roles</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#2f2a1f", marginTop: "4px" }}>{totalRoles}</div>
        </div>
        <div className="stat-card rounded p-3">
          <div style={{ fontSize: "12px", color: "#6f6653", fontWeight: "600" }}>Dedicated Admin</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#2f2a1f", marginTop: "4px" }}>{dedicatedRoles}</div>
        </div>
      </div>

      {/* Table */}
      {roles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#6f6653" }}>
          <div style={{ fontSize: "48px", opacity: 0.65, marginBottom: "16px" }}>🛡️</div>
          <div style={{ fontSize: "16px", color: "#2f2a1f", fontWeight: "600", marginBottom: "8px" }}>No roles found</div>
          <div style={{ fontSize: "14px" }}>Try adjusting your search filter</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid rgba(180, 145, 32, 0.16)" }}>
          <table className="data-table w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fff7da" }}>
                <th className="px-4 py-3 text-left font-700 text-sm" style={{ color: "#2f2a1f", borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>Role Name</th>
                <th className="px-4 py-3 text-left font-700 text-sm" style={{ color: "#2f2a1f", borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>Description</th>
                <th className="px-4 py-3 text-left font-700 text-sm" style={{ color: "#2f2a1f", borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>Type</th>
                <th className="px-4 py-3 text-left font-700 text-sm" style={{ color: "#2f2a1f", borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>Members</th>
                <th className="px-4 py-3 text-left font-700 text-sm" style={{ color: "#2f2a1f", borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role: any) => (
                <tr key={role.id} style={{ background: "white" }}>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", fontWeight: "600", color: "#2f2a1f" }}>{role.role_name}</td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", color: "#6f6653" }}>{role.description || "—"}</td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)" }}>
                    <span className="status-badge" style={{ background: role.is_dedicated_admin ? "rgba(46, 158, 91, 0.10)" : "rgba(180, 145, 32, 0.10)", color: role.is_dedicated_admin ? "#2e9e5b" : "#b8860b" }}>
                      {role.is_dedicated_admin ? "Dedicated" : "Shared"}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", color: "#6f6653" }}>
                    {role.current_member_count ?? 0} / {role.max_members === 0 ? "∞" : role.max_members}
                  </td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)" }}>
                    <div className="flex gap-2 flex-wrap">
                      <button className="btn-secondary px-3 py-1 rounded text-xs font-600" onClick={() => onEdit({ type: "role", ...role })}>
                        Edit
                      </button>
                      <button className="btn-danger px-3 py-1 rounded text-xs font-600" onClick={() => handleDeleteRole(role.id)}>
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

function ProtectedGroupsTab({ groups }: any) {
  const memberCount = groups.reduce((sum: number, g: any) => sum + (g.member_count || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-7" style={{ border: "1px solid rgba(180, 145, 32, 0.16)" }}>
      <div className="mb-6 pb-4" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#2f2a1f", marginBottom: "6px" }}>Protected Groups</h2>
        <p style={{ fontSize: "14px", color: "#6f6653" }}>View system-protected groups and their member counts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="stat-card rounded p-3">
          <div style={{ fontSize: "12px", color: "#6f6653", fontWeight: "600" }}>Total Groups</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#2f2a1f", marginTop: "4px" }}>{groups.length}</div>
        </div>
        <div className="stat-card rounded p-3">
          <div style={{ fontSize: "12px", color: "#6f6653", fontWeight: "600" }}>Total Members</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#2f2a1f", marginTop: "4px" }}>{memberCount}</div>
        </div>
      </div>

      {/* Table */}
      {groups.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#6f6653" }}>
          <div style={{ fontSize: "48px", opacity: 0.65, marginBottom: "16px" }}>📁</div>
          <div style={{ fontSize: "16px", color: "#2f2a1f", fontWeight: "600", marginBottom: "8px" }}>No protected groups found</div>
          <div style={{ fontSize: "14px" }}>Protected groups are managed by the system</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid rgba(180, 145, 32, 0.16)" }}>
          <table className="data-table w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fff7da" }}>
                <th className="px-4 py-3 text-left font-700 text-sm" style={{ color: "#2f2a1f", borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>Group Name</th>
                <th className="px-4 py-3 text-left font-700 text-sm" style={{ color: "#2f2a1f", borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>Description</th>
                <th className="px-4 py-3 text-left font-700 text-sm" style={{ color: "#2f2a1f", borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>Members</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group: any) => (
                <tr key={group.id} style={{ background: "white" }}>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", fontWeight: "600", color: "#2f2a1f" }}>{group.group_name}</td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", color: "#6f6653" }}>{group.description || "—"}</td>
                  <td className="px-4 py-3" style={{ borderBottom: "1px solid rgba(180, 145, 32, 0.10)", color: "#6f6653", fontWeight: "600" }}>{group.member_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EditModal({ data, onClose, onRefresh }: any) {
  const [formData, setFormData] = useState(data);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSave = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (data.type === "admin") {
        if (data.id) {
          const { error } = await supabase.from("admins").update(formData).eq("id", data.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("admins").insert([formData]);
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid rgba(180, 145, 32, 0.22)" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#2f2a1f" }}>
            {data.type === "admin" ? (data.id ? "Edit Admin" : "Add Admin") : (data.id ? "Edit Role" : "Add Role")}
          </h3>
          <button
            onClick={onClose}
            style={{ width: "32px", height: "32px", border: "none", background: "#fff6d8", borderRadius: "6px", cursor: "pointer", fontSize: "20px", color: "#b8860b" }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave}>
          {data.type === "admin" ? (
            <>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#2f2a1f", marginBottom: "8px" }}>Name *</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input w-full px-3 py-2 rounded text-sm"
                  required
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#2f2a1f", marginBottom: "8px" }}>Email *</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input w-full px-3 py-2 rounded text-sm"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#2f2a1f", marginBottom: "8px" }}>Role Name *</label>
                <input
                  type="text"
                  value={formData.role_name || ""}
                  onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                  className="form-input w-full px-3 py-2 rounded text-sm"
                  required
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#2f2a1f", marginBottom: "8px" }}>Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input w-full px-3 py-2 rounded text-sm"
                  rows={3}
                />
              </div>
              <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "rgba(244, 196, 48, 0.08)", border: "1px solid rgba(244, 196, 48, 0.18)", borderRadius: "6px" }}>
                <input
                  type="checkbox"
                  checked={formData.is_dedicated_admin || false}
                  onChange={(e) => setFormData({ ...formData, is_dedicated_admin: e.target.checked })}
                  style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#f4c430" }}
                />
                <label style={{ fontSize: "14px", color: "#2f2a1f", cursor: "pointer", fontWeight: "500" }}>Dedicated Admin Role</label>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#2f2a1f", marginBottom: "8px" }}>Max Members</label>
                <input
                  type="number"
                  value={formData.max_members || 0}
                  onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
                  className="form-input w-full px-3 py-2 rounded text-sm"
                  min="0"
                />
                <div style={{ fontSize: "12px", color: "#6f6653", marginTop: "4px" }}>0 means unlimited</div>
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
            <button type="submit" className="btn-primary px-4 py-2 rounded text-sm font-600" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button type="button" className="btn-secondary px-4 py-2 rounded text-sm font-600" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
