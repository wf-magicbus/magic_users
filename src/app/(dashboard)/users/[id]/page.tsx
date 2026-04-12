"use client";

import { useAuthGuard } from "@/lib/use-auth-guard";
import { mockUserDetail, mockLoginHistory, mockSessions } from "@/lib/mock-data";

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

export default function UserDetailPage() {
  const { loading } = useAuthGuard();

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const user = mockUserDetail;
  const userSessions = mockSessions.filter((s) => s.user_id === user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Detail: {user.name}</h1>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Name:</span>{" "}
            <span className="font-medium text-gray-900">{user.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Email:</span>{" "}
            <span className="font-medium text-gray-900">{user.email}</span>
          </div>
          <div>
            <span className="text-gray-500">Status:</span> {statusBadge(user.status)}
          </div>
          <div>
            <span className="text-gray-500">Role:</span>{" "}
            <span className="font-medium text-gray-900">{user.role || "---"}</span>
          </div>
          <div>
            <span className="text-gray-500">Last Login:</span>{" "}
            <span className="font-medium text-gray-900">{new Date(user.last_login).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Password Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Password Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Last Changed:</span>{" "}
            <span className="font-medium text-gray-900">{user.password_last_changed}</span>
          </div>
          <div>
            <span className="text-gray-500">Expires At:</span>{" "}
            <span className="font-medium text-gray-900">{user.password_expires_at}</span>
          </div>
          <div>
            <span className="text-gray-500">Must Change:</span>{" "}
            <span className={`font-medium ${user.must_change_password ? "text-red-600" : "text-gray-900"}`}>
              {user.must_change_password ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>

      {/* Lockout State */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lockout State</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Failed Attempts:</span>{" "}
            <span className="font-medium text-gray-900">{user.failed_attempts}</span>
          </div>
          <div>
            <span className="text-gray-500">Locked:</span>{" "}
            <span className={`font-medium ${user.is_locked ? "text-red-600" : "text-green-600"}`}>
              {user.is_locked ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>

      {/* Privileges */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Privileges</h2>
        <div className="flex flex-wrap gap-2">
          {user.privileges.map((priv) => (
            <span key={priv} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              {priv}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors">
            Unlock
          </button>
          <button className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors">
            Disable
          </button>
          <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
            Enable
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Force Password Reset
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
            Grant Privilege
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
            Revoke Privilege
          </button>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Login History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">Success</th>
              <th className="px-4 py-3 font-medium">IP Address</th>
              <th className="px-4 py-3 font-medium">Device</th>
            </tr>
          </thead>
          <tbody>
            {mockLoginHistory.map((entry, i) => (
              <tr key={entry.id} className={`border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                <td className="px-4 py-3 text-gray-600">{new Date(entry.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      entry.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {entry.success ? "Success" : "Failed"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{entry.ip_address}</td>
                <td className="px-4 py-3 text-gray-600">{entry.device}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sessions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Active Sessions</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">IP Address</th>
              <th className="px-4 py-3 font-medium">Device</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Started At</th>
            </tr>
          </thead>
          <tbody>
            {userSessions.map((session, i) => (
              <tr key={session.id} className={`border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                <td className="px-4 py-3 text-gray-600">{session.ip_address}</td>
                <td className="px-4 py-3 text-gray-600">{session.device}</td>
                <td className="px-4 py-3 text-gray-600">{session.location}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(session.started_at).toLocaleString()}</td>
              </tr>
            ))}
            {userSessions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No active sessions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
