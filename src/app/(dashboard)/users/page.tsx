"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/lib/use-auth-guard";

type User = {
  user_id: string;
  name: string;
  status: string;
  role: string | null;
  mfa_enabled: boolean;
  last_login: string;
};

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
  const { loading: authLoading } = useAuthGuard();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (searchValue: string, status: string) => {
    setFetching(true);
    setError(null);
    try {
      const params = new URLSearchParams({ search: searchValue, status, page: "1", limit: "50" });
      const res = await fetch(`/api/users?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    const timer = setTimeout(() => {
      fetchUsers(search, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, authLoading, fetchUsers]);

  if (authLoading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users Directory</h1>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name..."
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
          {!fetching && total > 0 && (
            <span className="self-center text-xs text-gray-400">{total} user{total !== 1 ? "s" : ""}</span>
          )}
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 border-b border-gray-100">{error}</div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Last Login</th>
              <th className="px-4 py-3 font-medium">MFA</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Loading...</td>
              </tr>
            ) : (
              users.map((user, i) => (
                <tr
                  key={user.user_id}
                  className={`border-b border-gray-50 hover:bg-gray-50 ${i % 2 === 1 ? "bg-gray-25" : ""}`}
                >
                  <td className="px-4 py-3">
                    <Link href={`/users/${user.user_id}`} className="text-blue-600 hover:underline font-medium">
                      {user.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{statusBadge(user.status)}</td>
                  <td className="px-4 py-3 text-gray-600">{user.role || "---"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : "---"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={user.mfa_enabled ? "text-green-600" : "text-gray-400"}>
                      {user.mfa_enabled ? "Enabled" : "Off"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!fetching && users.length === 0 && !error && (
          <div className="p-8 text-center text-gray-400 text-sm">No users found.</div>
        )}
      </div>
    </div>
  );
}
