"use client";

import { useAuthGuard } from "@/lib/use-auth-guard";
import { mockUsers, mockSessions, mockAdmins } from "@/lib/mock-data";

export default function DashboardPage() {
  const { loading } = useAuthGuard();

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const totalUsers = mockUsers.length;
  const activeSessions = mockSessions.filter((s) => s.is_active).length;
  const lockedAccounts = mockUsers.filter((u) => u.status === "locked").length;
  const adminsCount = mockAdmins.length;

  const cards = [
    { label: "Total Users", value: totalUsers, color: "bg-blue-50 text-blue-700" },
    { label: "Active Sessions", value: activeSessions, color: "bg-green-50 text-green-700" },
    { label: "Locked Accounts", value: lockedAccounts, color: "bg-red-50 text-red-700" },
    { label: "Admins", value: adminsCount, color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color} inline-block px-3 py-1 rounded-lg`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
