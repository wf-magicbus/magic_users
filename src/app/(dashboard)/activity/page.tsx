"use client";

import { useState } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { mockSessions, mockAccessLog } from "@/lib/mock-data";

const tabs = ["Sessions", "Access Log"] as const;
type Tab = (typeof tabs)[number];

const actionBadge = (action: string) => {
  const styles: Record<string, string> = {
    granted: "bg-green-100 text-green-700",
    revoked: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[action] || "bg-gray-100 text-gray-600"}`}>
      {action}
    </span>
  );
};

export default function ActivityPage() {
  const { loading } = useAuthGuard();
  const [activeTab, setActiveTab] = useState<Tab>("Sessions");

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Activity</h1>

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

      {activeTab === "Sessions" && <SessionsTab />}
      {activeTab === "Access Log" && <AccessLogTab />}
    </div>
  );
}

function SessionsTab() {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">IP Address</th>
            <th className="px-4 py-3 font-medium">Device</th>
            <th className="px-4 py-3 font-medium">Location</th>
            <th className="px-4 py-3 font-medium">Started At</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockSessions
            .filter((s) => s.is_active)
            .map((session, i) => (
              <tr key={session.id} className={`border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                <td className="px-4 py-3 font-medium text-gray-900">{session.user_name}</td>
                <td className="px-4 py-3 text-gray-600">{session.user_email}</td>
                <td className="px-4 py-3 text-gray-600">{session.ip_address}</td>
                <td className="px-4 py-3 text-gray-600">{session.device}</td>
                <td className="px-4 py-3 text-gray-600">{session.location}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(session.started_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <button className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded hover:bg-red-100 transition-colors">
                    Terminate
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function AccessLogTab() {
  const [actionFilter, setActionFilter] = useState("all");

  const filtered = mockAccessLog.filter((entry) => {
    return actionFilter === "all" || entry.action === actionFilter;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value="all">All Actions</option>
          <option value="granted">Granted</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium">Item</th>
            <th className="px-4 py-3 font-medium">Performed By</th>
            <th className="px-4 py-3 font-medium">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((entry, i) => (
            <tr key={entry.id} className={`border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
              <td className="px-4 py-3 font-medium text-gray-900">{entry.user_name}</td>
              <td className="px-4 py-3">{actionBadge(entry.action)}</td>
              <td className="px-4 py-3 text-gray-600">{entry.item}</td>
              <td className="px-4 py-3 text-gray-600">{entry.performed_by_name}</td>
              <td className="px-4 py-3 text-gray-600">{new Date(entry.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div className="p-8 text-center text-gray-400 text-sm">No log entries found.</div>
      )}
    </div>
  );
}
