'use client';

import React, { useState, useEffect } from 'react';
import { useAuthGuard } from '@/lib/use-auth-guard';
import {
  Card,
  Button,
  Badge,
  StatusDot,
  Table,
  Header,
  Sidebar,
  Layout2,
  semanticColors,
} from '@/components/ui2';
import { StatsCard, InfoCard, LoadingOverlay, Divider } from '@/components/ui2/components/Utilities';
import { mockUsers, mockSessions, mockAdmins } from '@/lib/mock-data';

const NAV_ITEMS = [
  { id: 'dashboard2', label: 'Dashboard', icon: '📊', section: 'Main' },
  { id: 'users2', label: 'Users', icon: '👥', section: 'Main' },
  { id: 'administration2', label: 'Administration', icon: '⚙️', section: 'Main' },
  { id: 'policies2', label: 'Policies', icon: '🔒', section: 'Policies' },
  { id: 'activity2', label: 'Activity', icon: '📋', section: 'Monitor' },
];

export default function Dashboard2Page() {
  const { adminSession, loading } = useAuthGuard();
  const [activeNav, setActiveNav] = useState('dashboard2');
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
          activeItem={activeNav}
          onItemClick={setActiveNav}
          branding={{ title: 'Magic Users' }}
        />
      }
    >
      {/* Content */}
    </Layout2>
  );
}