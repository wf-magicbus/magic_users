'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/lib/use-auth-guard';
import {
  Card,
  Button,
  Badge,
  Table,
  Tabs,
  Header,
  Sidebar,
  Layout2,
  semanticColors,
} from '@/components/ui2';
import { mockAdmins, mockAdminRoles, mockProtectedGroups } from '@/lib/mock-data';

const NAV_ITEMS = [
  { id: 'dashboard2', label: 'Dashboard', icon: '📊', section: 'Main', route: '/dashboard2' },
  { id: 'users2', label: 'Users', icon: '👥', section: 'Main', route: '/users2' },
  { id: 'administration2', label: 'Administration', icon: '⚙️', section: 'Main', route: '/administration2' },
  { id: 'policies2', label: 'Policies', icon: '🔒', section: 'Policies', route: '/policies2' },
  { id: 'activity2', label: 'Activity', icon: '📋', section: 'Monitor', route: '/activity2' },
];

const ADMIN_TABS = [
  { id: 'accounts', label: 'Admin Accounts', icon: '👤' },
  { id: 'roles', label: 'Admin Roles', icon: '🎭' },
  { id: 'groups', label: 'Protected Groups', icon: '👨‍👩‍👧‍👦' },
];

export default function Administration2Page() {
  const router = useRouter();
  const { loading } = useAuthGuard();
  const [activeAdminTab, setActiveAdminTab] = useState('accounts');

  if (loading) return <div>Loading...</div>;

  return (
    <Layout2
      header={<Header title="Magic Users" subtitle="Admin Dashboard v2" />}
      sidebar={
        <Sidebar
          items={NAV_ITEMS}
          activeItem="administration2"
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
          Administration
        </h1>

        <Tabs
          tabs={ADMIN_TABS}
          defaultTab="accounts"
          onChange={setActiveAdminTab}
        >
          {activeAdminTab === 'accounts' && (
            <Tabs.Content tabId="accounts">
              <Card title="Admin Accounts">
                <Table>
                  <Table.Head>
                    <Table.Row header>
                      <Table.Cell header>Admin</Table.Cell>
                      <Table.Cell header>Role</Table.Cell>
                      <Table.Cell header>Privileges</Table.Cell>
                      <Table.Cell header>Created</Table.Cell>
                      <Table.Cell header>Actions</Table.Cell>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {mockAdmins.map((admin) => (
                      <Table.Row key={admin.id}>
                        <Table.Cell>
                          <strong>{admin.name}</strong>
                          <div style={{ fontSize: '12px', color: semanticColors.textSecondary }}>
                            {admin.email}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <code style={{ fontSize: '12px' }}>{admin.role}</code>
                        </Table.Cell>
                        <Table.Cell>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {admin.privileges.slice(0, 2).map((p) => (
                              <span
                                key={p}
                                style={{
                                  fontSize: '10px',
                                  background: 'rgba(50, 184, 198, 0.1)',
                                  color: 'rgba(50, 184, 198, 1)',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                }}
                              >
                                {p}
                              </span>
                            ))}
                            {admin.privileges.length > 2 && (
                              <span style={{ fontSize: '10px', color: semanticColors.textSecondary }}>
                                +{admin.privileges.length - 2}
                              </span>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell style={{ fontSize: '12px' }}>
                          {new Date(admin.created_at).toLocaleDateString()}
                        </Table.Cell>
                        <Table.Cell>
                          <Button size="sm" variant="secondary">
                            Edit
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Card>
            </Tabs.Content>
          )}

          {activeAdminTab === 'roles' && (
            <Tabs.Content tabId="roles">
              <Card title="Admin Roles">
                <Table>
                  <Table.Head>
                    <Table.Row header>
                      <Table.Cell header>Role Name</Table.Cell>
                      <Table.Cell header>Description</Table.Cell>
                      <Table.Cell header>Dedicated Admin</Table.Cell>
                      <Table.Cell header>Max Members</Table.Cell>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {mockAdminRoles.map((role) => (
                      <Table.Row key={role.id}>
                        <Table.Cell>
                          <strong>{role.role_name}</strong>
                        </Table.Cell>
                        <Table.Cell>{role.description}</Table.Cell>
                        <Table.Cell>
                          <Badge status={role.is_dedicated_admin ? 'active' : 'pending'}>
                            {role.is_dedicated_admin ? 'Yes' : 'No'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          {role.max_members === 0 ? 'Unlimited' : role.max_members}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Card>
            </Tabs.Content>
          )}

          {activeAdminTab === 'groups' && (
            <Tabs.Content tabId="groups">
              <Card title="Protected Groups">
                <Table>
                  <Table.Head>
                    <Table.Row header>
                      <Table.Cell header>Group Name</Table.Cell>
                      <Table.Cell header>Description</Table.Cell>
                      <Table.Cell header>Member Count</Table.Cell>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {mockProtectedGroups.map((group) => (
                      <Table.Row key={group.id}>
                        <Table.Cell>
                          <strong>{group.group_name}</strong>
                        </Table.Cell>
                        <Table.Cell>{group.description}</Table.Cell>
                        <Table.Cell>{group.member_count}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Card>
            </Tabs.Content>
          )}
        </Tabs>
      </div>
    </Layout2>
  );
}