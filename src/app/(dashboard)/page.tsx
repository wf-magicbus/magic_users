"use client";

import { useAuthGuard } from "@/lib/use-auth-guard";
import { mockUsers, mockSessions, mockAdmins } from "@/lib/mock-data";
import { useState, useEffect, use } from 'react';

export default function DashboardPage() {
  const { loading } = useAuthGuard();
  const [adminsCount, setAdminsCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetch('/api/admins')
      .then(res => res.json())
      .then(data => setAdminsCount(data.admins?.length || 0))
      .catch(err => {
        console.error("Error fetching admins:", err);
        setAdminsCount(0); // Fallback to 0 if there's an error
      });
  }, []);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setTotalUsers(data.total || 0))
      .catch(err => {
        console.error("Error fetching total users:", err);
        setTotalUsers(0); // Fallback to 0 if there's an error
      });
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }


  //const [data, setData] = useState(null);
  // const totalUsers =  fetch('/api/users')  mockUsers.length;
  // const activeSessions = mockSessions.filter((s) => s.is_active).length;
  // const lockedAccounts = mockUsers.filter((u) => u.status === "locked").length;
  // const adminsCount = mockAdmins.length;
  // const totalUsers = fetch('/api/users').then(res => res.json()).then(data => data.total).catch(err => {
  //  console.error("Error fetching total users:", err);
  //   return 0; // Fallback to 0 if there's an error
  // });
  // const activeSessions = fetch('/api/sessions').then(res => res.json()).then(data => data.sessions?.length).catch(err => {
  //   console.error("Error fetching sessions:", err);
  //   return 0; // Fallback to 0 if there's an error
  // });
  // const lockedAccounts = fetch('/api/users').then(res => res.json()).then(data => data.users).catch(err => {
  //   console.error("Error fetching locked accounts:", err);
  //   return 0; // Fallback to 0 if there's an error
  // });
  // Admins count is now managed by useEffect/useState above.

  const cards = [
    { label: "Total Users", value: totalUsers, color: "bg-blue-50 text-blue-700" },
    // { label: "Active Sessions", value: activeSessions, color: "bg-green-50 text-green-700" },
    // { label: "Locked Accounts", value: lockedAccounts, color: "bg-red-50 text-red-700" },
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
