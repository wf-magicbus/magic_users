'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/lib/use-auth-guard';
import {
  Card,
  Button,
  Badge,
  Table,
  Header,
  Sidebar,
  Layout2,
  semanticColors,
} from '@/components/ui2';
import { StatsCard, InfoCard, LoadingOverlay, Divider } from '@/components/ui2/components/Utilities';
import { mockUsers, mockSessions, mockAdmins } from '@/lib/mock-data';

const NAV_ITEMS = [
  { id: 'dashboard2', label: 'Dashboard', icon: '📊', section: 'Main', route: '/dashboard2' },
  { id: 'users2', label: 'Users', icon: '👥', section: 'Main', route: '/users2' },
  { id: 'administration2', label: 'Administration', icon: '⚙️', section: 'Main', route: '/administration2' },
  { id: 'policies2', label: 'Policies', icon: '🔒', section: 'Policies', route: '/policies2' },
  { id: 'activity2', label: 'Activity', icon: '📋', section: 'Monitor', route: '/activity2' },
];

export default function Dashboard2Page() {
  const router = useRouter();
  const { adminSession, loading } = useAuthGuard();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    lockedAccounts: 0,
    admins: 0,
  });

  useEffect(() => {
    const activeSessions = mockSessions.filter((s) => s.is_active).length;
    const lockedUsers = mockUsers.filter((u) => u.status === 'locked').length;

    setStats({
      totalUsers: mockUsers.length,
      activeSessions,
      lockedAccounts: lockedUsers,
      admins: mockAdmins.length,
    });
  }, []);

  if (loading) {
    return <LoadingOverlay message="Initializing dashboard..." />;
  }

  // Rest of component...
  return (
    <Layout2
      header={
        <Header
          title="Magic Users"
          subtitle="Admin Dashboard v2"
          rightContent={
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: semanticColors.textSecondary }}>
                👤 {adminSession?.role || 'Admin'}
              </span>
            </div>
          }
        />
      }
      sidebar={
        <Sidebar
          items={NAV_ITEMS}
          activeItem="dashboard2"
          onItemClick={(itemId) => {
            const item = NAV_ITEMS.find(i => i.id === itemId);
            if (item?.route) router.push(item.route);
          }}
          branding={{ title: 'Magic Users' }}
        />
      }
    >
      <div style={{ width: '100%' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '24px' }}>
          Dashboard Overview
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <StatsCard
            label="Total Users"
            value={stats.totalUsers}
            subtext="Registered user accounts"
          />
          <StatsCard
            label="Active Sessions"
            value={stats.activeSessions}
            subtext="Currently logged in users"
          />
          <StatsCard
            label="Locked Accounts"
            value={stats.lockedAccounts}
            subtext="Accounts requiring attention"
          />
          <StatsCard
            label="Admin Users"
            value={stats.admins}
            subtext="Privileged administrators"
          />
        </div>

        <InfoCard
          icon="ℹ️"
          title="Dashboard Information"
          text="This dashboard provides real-time statistics about user accounts, active sessions, and system security status. Monitor these metrics regularly to ensure system health and security."
        />
      </div>
    </Layout2>
  );
}