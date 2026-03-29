'use client';

import React, { useState } from 'react';
import { useAuthGuard } from '@/lib/use-auth-guard';
import {
  Card,
  Tabs,
  Table,
  Header,
  Sidebar,
  Layout2,
  Badge,
  semanticColors,
} from '@/components/ui2';
import { mockSessions, mockAccessLog } from '@/lib/mock-data';

const NAV_ITEMS = [
  { id: 'dashboard2', label: 'Dashboard', icon: '📊', section: 'Main' },
  { id: 'users2', label: 'Users', icon: '👥', section: 'Main' },
  { id: 'administration2', label: 'Administration', icon: '⚙️', section: 'Main' },
  { id: 'policies2', label: 'Policies', icon: '🔒', section: 'Policies' },
  { id: 'activity2', label: 'Activity', icon: '📋', section: 'Monitor' },
];
const ACTIVITY_TABS = [
  { id: 'sessions', label: 'Active Sessions', icon: '🖥️' },
  { id: 'access', label: 'Access Log', icon: '📋' },
];

export default function Activity2Page() {
  const { loading } = useAuthGuard();
  const [activeNav, setActiveNav] = useState('activity2');
  const [activeActivityTab, setActiveActivityTab] = useState('sessions');

  if (loading) return <div>Loading...</div>;

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
          Activity & Monitoring
        </h1>

        <Tabs
          tabs={ACTIVITY_TABS}
          defaultTab="sessions"
          onChange={setActiveActivityTab}
        >
          {activeActivityTab === 'sessions' && (
            <Tabs.Content>
              <Card title="Active Sessions">
                <Table>
                  <Table.Head>
                    <Table.Row header>
                      <Table.Cell header>User</Table.Cell>
                      <Table.Cell header>IP Address</Table.Cell>
                      <Table.Cell header>Device</Table.Cell>
                      <Table.Cell header>Location</Table.Cell>
                      <Table.Cell header>Started</Table.Cell>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {mockSessions
                      .filter((s) => s.is_active)
                      .map((session) => (
                        <Table.Row key={session.id}>
                          <Table.Cell>
                            <strong>{session.user_name}</strong>
                          </Table.Cell>
                          <Table.Cell>{session.ip_address}</Table.Cell>
                          <Table.Cell>{session.device}</Table.Cell>
                          <Table.Cell>{session.location}</Table.Cell>
                          <Table.Cell style={{ fontSize: '12px' }}>
                            {new Date(session.started_at).toLocaleString()}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                  </Table.Body>
                </Table>
              </Card>
            </Tabs.Content>
          )}

          {activeActivityTab === 'access' && (
            <Tabs.Content>
              <Card title="Access Log (Grants & Revokes)">
                <Table>
                  <Table.Head>
                    <Table.Row header>
                      <Table.Cell header>Time</Table.Cell>
                      <Table.Cell header>User</Table.Cell>
                      <Table.Cell header>Action</Table.Cell>
                      <Table.Cell header>Item</Table.Cell>
                      <Table.Cell header>By</Table.Cell>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {mockAccessLog.map((entry) => (
                      <Table.Row key={entry.id}>
                        <Table.Cell style={{ fontSize: '12px' }}>
                          {new Date(entry.timestamp).toLocaleString()}
                        </Table.Cell>
                        <Table.Cell>
                          <strong>{entry.user_name}</strong>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            status={
                              entry.action === 'granted' ? 'active' : 'locked'
                            }
                          >
                            {entry.action}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>{entry.item}</Table.Cell>
                        <Table.Cell>{entry.performed_by_name}</Table.Cell>
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