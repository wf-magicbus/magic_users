"use client";

import { useState } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { mockAdmins, mockAdminRoles, mockProtectedGroups } from "@/lib/mock-data";

const tabs = ["Admin Accounts", "Admin Roles", "Protected Groups"] as const;
type Tab = (typeof tabs)[number];

export default function AdministrationPage() {
  const { loading } = useAuthGuard();
  const [activeTab, setActiveTab] = useState<Tab>("Admin Accounts");

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Administration</h1>

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

      {activeTab === "Admin Accounts" && <AdminAccountsTab />}
      {activeTab === "Admin Roles" && <AdminRolesTab />}
      {activeTab === "Protected Groups" && <ProtectedGroupsTab />}
    </div>
  );
}

function AdminAccountsTab() {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
          Add Admin
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Privileges</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockAdmins.map((admin, i) => (
              <tr key={admin.id} className={`border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                <td className="px-4 py-3 font-medium text-gray-900">{admin.name}</td>
                <td className="px-4 py-3 text-gray-600">{admin.email}</td>
                <td className="px-4 py-3 text-gray-600">{admin.role}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {admin.privileges.map((priv) => (
                      <span key={priv} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {priv}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{new Date(admin.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded hover:bg-red-100 transition-colors">
                      Delete
                    </button>
                    <button className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded hover:bg-blue-100 transition-colors">
                      Edit Privileges
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminRolesTab() {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="px-4 py-3 font-medium">Role Name</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <th className="px-4 py-3 font-medium">Dedicated Admin</th>
            <th className="px-4 py-3 font-medium">Max Members</th>
            <th className="px-4 py-3 font-medium">Current Members</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockAdminRoles.map((role, i) => (
            <tr key={role.id} className={`border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
              <td className="px-4 py-3 font-medium text-gray-900">{role.role_name}</td>
              <td className="px-4 py-3 text-gray-600">{role.description}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    role.is_dedicated_admin ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {role.is_dedicated_admin ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">{role.max_members === 0 ? "Unlimited" : role.max_members}</td>
              <td className="px-4 py-3 text-gray-600">{role.current_member_count}</td>
              <td className="px-4 py-3">
                <button className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded hover:bg-blue-100 transition-colors">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProtectedGroupsTab() {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="px-4 py-3 font-medium">Group Name</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <th className="px-4 py-3 font-medium">Member Count</th>
          </tr>
        </thead>
        <tbody>
          {mockProtectedGroups.map((group, i) => (
            <tr key={group.id} className={`border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
              <td className="px-4 py-3 font-medium text-gray-900">{group.group_name}</td>
              <td className="px-4 py-3 text-gray-600">{group.description}</td>
              <td className="px-4 py-3 text-gray-600">{group.member_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
