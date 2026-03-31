"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthGuard } from "@/lib/use-auth-guard";
import {
  Card,
  Badge,
  Button,
  Header,
  Sidebar,
  Layout2
} from "@/components/ui2";
import { mockUserDetail, mockLoginHistory, mockSessions } from "@/lib/mock-data";

const NAV_ITEMS = [
  { id: "dashboard2", label: "Dashboard", icon: "📊", section: "Main", route: "/dashboard2" },
  { id: "users2", label: "Users", icon: "👥", section: "Main", route: "/users2" },
  { id: "administration2", label: "Administration", icon: "⚙️", section: "Main", route: "/administration2" },
  { id: "policies2", label: "Policies", icon: "🔒", section: "Policies", route: "/policies2" },
  { id: "activity2", label: "Activity", icon: "📋", section: "Monitor", route: "/activity2" }
];

export default function UserDetailPage() {

  const router = useRouter();
  const params = useParams();
  const { loading } = useAuthGuard();

  const userId = params?.id as string;

  const [user, setUser] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  // FETCH USER DATA
  useEffect(() => {
    const fetchUser = async () => {
      try {

        // If real API exists
        const res = await fetch(`/api/users/${userId}`);

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setSessions(data.sessions || []);
          setLoginHistory(data.loginHistory || []);
        } else {
          throw new Error("API not available");
        }

      } catch {

        // fallback to mock
        setUser(mockUserDetail);
        setSessions(mockSessions.filter(s => s.user_id === mockUserDetail.id));
        setLoginHistory(mockLoginHistory);

      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [userId]);

  // ACTIONS

  const handleUnlock = async () => {
    await fetch(`/api/users/${userId}/unlock`, { method: "POST" });
    alert("User unlocked");
  };

  const handleDisable = async () => {
    await fetch(`/api/users/${userId}/disable`, { method: "POST" });
    alert("User disabled");
  };

  const handleEnable = async () => {
    await fetch(`/api/users/${userId}/enable`, { method: "POST" });
    alert("User enabled");
  };

  const handlePasswordReset = async () => {
    await fetch(`/api/users/${userId}/force-reset`, { method: "POST" });
    alert("Password reset triggered");
  };

  if (loading || loadingUser) {
    return <div className="text-gray-500 p-6">Loading...</div>;
  }

  if (!user) {
    return <div className="text-red-500 p-6">User not found</div>;
  }

  return (
    <Layout2
      header={<Header title="Magic Users" subtitle="Admin Dashboard v2" />}
      sidebar={
        <Sidebar
          items={NAV_ITEMS}
          activeItem="users2"
          onItemClick={(id) => {
            const item = NAV_ITEMS.find(i => i.id === id);
            if (item?.route) router.push(item.route);
          }}
          branding={{ title: "Magic Users" }}
        />
      }
    >

      <div style={{ width: "100%" }}>

        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 24 }}>
          User Detail: {user.name}
        </h1>

        {/* USER INFO */}

        <Card title="User Information">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            <div><b>Name:</b> {user.name}</div>
            <div><b>Email:</b> {user.email}</div>

            <div>
              <b>Status:</b>{" "}
              <Badge status={user.status}>{user.status}</Badge>
            </div>

            <div><b>Role:</b> {user.role || "---"}</div>

            <div>
              <b>MFA:</b>{" "}
              {user.mfa_enabled ? "Enabled" : "Off"}
            </div>

            <div>
              <b>Last Login:</b>{" "}
              {new Date(user.last_login).toLocaleString()}
            </div>

          </div>
        </Card>


        {/* PASSWORD */}

        <Card title="Password Information" style={{ marginTop: 20 }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            <div>
              <b>Last Changed:</b> {user.password_last_changed}
            </div>

            <div>
              <b>Expires At:</b> {user.password_expires_at}
            </div>

            <div>
              <b>Must Change:</b>{" "}
              {user.must_change_password ? "Yes" : "No"}
            </div>

          </div>

        </Card>


        {/* LOCKOUT */}

        <Card title="Lockout State" style={{ marginTop: 20 }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            <div>
              <b>Failed Attempts:</b> {user.failed_attempts}
            </div>

            <div>
              <b>Locked:</b> {user.is_locked ? "Yes" : "No"}
            </div>

          </div>

        </Card>


        {/* PRIVILEGES */}

        <Card title="Privileges" style={{ marginTop: 20 }}>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {user.privileges?.map((p: string) => (
              <Badge key={p} status="active">
                {p}
              </Badge>
            ))}
          </div>

        </Card>


        {/* ACTIONS */}

        <Card title="Actions" style={{ marginTop: 20 }}>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>

            <Button variant="secondary" onClick={handleUnlock}>
              Unlock
            </Button>

            <Button variant="danger" onClick={handleDisable}>
              Disable
            </Button>

            <Button variant="primary" onClick={handleEnable}>
              Enable
            </Button>

            <Button variant="secondary" onClick={handlePasswordReset}>
              Force Password Reset
            </Button>

          </div>

        </Card>


        {/* LOGIN HISTORY */}

        <Card title="Login History" style={{ marginTop: 20 }}>

          <table style={{ width: "100%" }}>

            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Success</th>
                <th>IP</th>
                <th>Device</th>
              </tr>
            </thead>

            <tbody>
              {loginHistory.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>

                  <td>
                    <Badge status={entry.success ? "active" : "locked"}>
                      {entry.success ? "Success" : "Failed"}
                    </Badge>
                  </td>

                  <td>{entry.ip_address}</td>
                  <td>{entry.device}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </Card>


        {/* ACTIVE SESSIONS */}

        <Card title="Active Sessions" style={{ marginTop: 20 }}>

          <table style={{ width: "100%" }}>

            <thead>
              <tr>
                <th>IP</th>
                <th>Device</th>
                <th>Location</th>
                <th>Started</th>
              </tr>
            </thead>

            <tbody>

              {sessions.length === 0 && (
                <tr>
                  <td colSpan={4}>No active sessions</td>
                </tr>
              )}

              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>{s.ip_address}</td>
                  <td>{s.device}</td>
                  <td>{s.location}</td>
                  <td>{new Date(s.started_at).toLocaleString()}</td>
                </tr>
              ))}

            </tbody>

          </table>

        </Card>

      </div>

    </Layout2>
  );
}