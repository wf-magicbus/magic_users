'use client';

import React, { useState } from 'react';
import { useAuthGuard } from '@/lib/use-auth-guard';
import {
  Card,
  Button,
  Tabs,
  Header,
  Sidebar,
  Layout2,
  Input,
  Select,
  semanticColors,
} from '@/components/ui2';
import { mockPasswordPolicies, mockLockoutPolicy } from '@/lib/mock-data';

const NAV_ITEMS = [
  // ... same items
];

const POLICY_TABS = [
  { id: 'password', label: 'Password Policy', icon: '🔑' },
  { id: 'lockout', label: 'Lockout Policy', icon: '🔒' },
];

export default function Policies2Page() {
  const { loading } = useAuthGuard();
  const [activeNav, setActiveNav] = useState('policies2');
  const [activePolicyTab, setActivePolicyTab] = useState('password');
  const [selectedRole, setSelectedRole] = useState('all_users');

  if (loading) return <div>Loading...</div>;

  const currentPolicy = mockPasswordPolicies.find((p) => p.role === selectedRole);

  return (
    <Layout2
      header={<Header title="Magic Users" subtitle="Admin Dashboard v2" />}
      sidebar={
        <Sidebar
          items={NAV_ITEMS}
          activeItem={activeNav}
          onItemClick={setActiveNav}
          branding={{ title: 'Magic Users' }}
        />
      }
    >
      <div style={{ width: '100%' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '24px' }}>
          Security Policies
        </h1>

        <Tabs
          tabs={POLICY_TABS}
          defaultTab="password"
          onChange={setActivePolicyTab}
        >
          {activePolicyTab === 'password' && (
            <Tabs.Content>
              <Card title="Password Policy Configuration">
                <div style={{ marginBottom: '20px' }}>
                  <Select
                    label="Select Role"
                    options={mockPasswordPolicies.map((p) => ({
                      value: p.role,
                      label: p.role.replace(/_/g, ' ').toUpperCase(),
                    }))}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  />
                </div>

                {currentPolicy && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <Input
                      label="Min Password Length"
                      type="number"
                      value={currentPolicy.min_password_length}
                      disabled
                    />
                    <Input
                      label="Password History Depth"
                      type="number"
                      value={currentPolicy.password_history_depth}
                      disabled
                    />
                    <Input
                      label="Max Password Age (Days)"
                      type="number"
                      value={currentPolicy.max_password_age_days}
                      disabled
                    />
                    <Input
                      label="Min Password Age (Days)"
                      type="number"
                      value={currentPolicy.min_password_age_days}
                      disabled
                    />
                  </div>
                )}
              </Card>
            </Tabs.Content>
          )}

          {activePolicyTab === 'lockout' && (
            <Tabs.Content>
              <Card title="Account Lockout Policy">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <Input
                    label="Lockout Duration (Minutes)"
                    type="number"
                    value={mockLockoutPolicy.lockout_duration_minutes}
                    disabled
                  />
                  <Input
                    label="Failed Attempts Threshold"
                    type="number"
                    value={mockLockoutPolicy.lockout_threshold_attempts}
                    disabled
                  />
                  <Input
                    label="Reset Counter After (Minutes)"
                    type="number"
                    value={mockLockoutPolicy.reset_counter_after_minutes}
                    disabled
                  />
                </div>
              </Card>
            </Tabs.Content>
          )}
        </Tabs>
      </div>
    </Layout2>
  );
}