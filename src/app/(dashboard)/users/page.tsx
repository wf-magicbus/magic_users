"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { mockUsers } from "@/lib/mock-data";

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    locked: "bg-red-100 text-red-700",
    disabled: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

export default function UsersPage() {
  const { loading } = useAuthGuard();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const filtered = mockUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users Directory</h1>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Last Login</th>
              <th className="px-4 py-3 font-medium">MFA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <tr
                key={user.id}
                className={`border-b border-gray-50 hover:bg-gray-50 ${i % 2 === 1 ? "bg-gray-25" : ""}`}
              >
                <td className="px-4 py-3">
                  <Link href={`/users/${user.id}`} className="text-blue-600 hover:underline font-medium">
                    {user.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">{statusBadge(user.status)}</td>
                <td className="px-4 py-3 text-gray-600">{user.role || "---"}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(user.last_login).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={user.mfa_enabled ? "text-green-600" : "text-gray-400"}>
                    {user.mfa_enabled ? "Enabled" : "Off"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">No users found.</div>
        )}
      </div>
    </div>
  );
}
