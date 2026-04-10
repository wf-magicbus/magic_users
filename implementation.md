# UI v2 Implementation Guide - Step by Step

## Overview

This guide walks through integrating the new UI v2 components into the existing Magic Users Next.js project.

**Key Points:**
- ✅ All existing APIs remain unchanged
- ✅ All existing hooks and business logic remain unchanged
- ✅ Both v1 and v2 UIs run simultaneously
- ✅ New routes use `/page2` suffix
- ✅ New components in `src/components/ui2/`

---

## Phase 1: Copy Foundation Components

### Step 1.1: Create UI2 Directory Structure

```bash
mkdir -p src/components/ui2
mkdir -p src/components/ui2/components
mkdir -p src/app/(dashboard2)
```

### Step 1.2: Copy All Component Files

Copy the following files from `/home/claude/magic-users-v2/` to your project:

```
/home/claude/magic-users-v2/theme.ts
    ↓
src/components/ui2/theme.ts

/home/claude/magic-users-v2/components/Button.tsx
    ↓
src/components/ui2/components/Button.tsx

/home/claude/magic-users-v2/components/Card.tsx
    ↓
src/components/ui2/components/Card.tsx

/home/claude/magic-users-v2/components/Input.tsx
    ↓
src/components/ui2/components/Input.tsx

/home/claude/magic-users-v2/components/Select.tsx
    ↓
src/components/ui2/components/Select.tsx

/home/claude/magic-users-v2/components/Table.tsx
    ↓
src/components/ui2/components/Table.tsx

/home/claude/magic-users-v2/components/Badge.tsx
    ↓
src/components/ui2/components/Badge.tsx

/home/claude/magic-users-v2/components/Modal.tsx
    ↓
src/components/ui2/components/Modal.tsx

/home/claude/magic-users-v2/components/Tabs.tsx
    ↓
src/components/ui2/components/Tabs.tsx

/home/claude/magic-users-v2/components/Header.tsx
    ↓
src/components/ui2/components/Header.tsx

/home/claude/magic-users-v2/components/Sidebar.tsx
    ↓
src/components/ui2/components/Sidebar.tsx

/home/claude/magic-users-v2/components/Layout2.tsx
    ↓
src/components/ui2/components/Layout2.tsx

/home/claude/magic-users-v2/components/Utilities.tsx
    ↓
src/components/ui2/components/Utilities.tsx

/home/claude/magic-users-v2/components/index.ts
    ↓
src/components/ui2/components/index.ts
```

### Step 1.3: Update Component Index

Create `src/components/ui2/index.ts`:

```typescript
// Export all components
export * from './components/Button';
export * from './components/Card';
export * from './components/Input';
export * from './components/Select';
export * from './components/Table';
export * from './components/Badge';
export * from './components/Modal';
export * from './components/Tabs';
export * from './components/Header';
export * from './components/Sidebar';
export * from './components/Layout2';
export * from './components/Utilities';
export { 
  colors, 
  semanticColors, 
  radius, 
  shadows, 
  typography 
} from './theme';
```

---

## Phase 2: Create Layout Wrapper

### Step 2.1: Create Dashboard2 Layout

Create `src/app/(dashboard2)/layout.tsx`:

```typescript
'use client';

import React from 'react';
import { semanticColors } from '@/components/ui2/theme';

export default function Dashboard2Layout({ children }: { children: React.ReactNode }) {
  const layoutStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: semanticColors.background,
  };

  return (
    <html lang="en">
      <body style={layoutStyle}>
        {children}
      </body>
    </html>
  );
}
```

---

## Phase 3: Implement Dashboard2 Page

### Step 3.1: Create Dashboard2 Page

Copy example from `/home/claude/magic-users-v2/examples/Dashboard2Page.tsx`

Create `src/app/(dashboard2)/dashboard2/page.tsx`:

```typescript
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
```

---

## Phase 4: Implement Users2 Page

### Step 4.1: Create Users2 Page

Copy from `/home/claude/magic-users-v2/examples/Users2Page.tsx`

Create `src/app/(dashboard2)/users2/page.tsx`:

```typescript
'use client';

import React, { useState, useMemo } from 'react';
import { useAuthGuard } from '@/lib/use-auth-guard';
import {
  Card,
  Button,
  Badge,
  StatusDot,
  Table,
  Modal,
  Input,
  Select,
  Header,
  Sidebar,
  Layout2,
  semanticColors,
} from '@/components/ui2';
import {
  SearchFilterBar,
  EmptyState,
  Divider,
  ConfirmationDialog,
  ErrorMessage,
  SuccessMessage,
} from '@/components/ui2/components/Utilities';
import { mockUsers } from '@/lib/mock-data';

const NAV_ITEMS = [
  // ... same as dashboard
];

interface UserFormData {
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function Users2Page() {
  // State management
  const { loading } = useAuthGuard();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeNav, setActiveNav] = useState('users2');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: '',
    status: 'active',
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [users, setUsers] = useState(mockUsers);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchTerm, statusFilter, users]);

  // CRUD handlers
  const handleOpenModal = (user?: any) => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role || '',
        status: user.status,
      });
      setEditingUserId(user.id);
    } else {
      setFormData({ name: '', email: '', role: '', status: 'active' });
      setEditingUserId(null);
    }
    setIsModalOpen(true);
  };

  // Rest of handlers and render...
}
```

---

## Phase 5: Implement Administration2 Page

### Step 5.1: Create Administration2 Page

Create `src/app/(dashboard2)/administration2/page.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
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
  // ... same items
];

const ADMIN_TABS = [
  { id: 'accounts', label: 'Admin Accounts', icon: '👤' },
  { id: 'roles', label: 'Admin Roles', icon: '🎭' },
  { id: 'groups', label: 'Protected Groups', icon: '👨‍👩‍👧‍👦' },
];

export default function Administration2Page() {
  const { loading } = useAuthGuard();
  const [activeNav, setActiveNav] = useState('administration2');
  const [activeAdminTab, setActiveAdminTab] = useState('accounts');

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
          Administration
        </h1>

        <Tabs
          tabs={ADMIN_TABS}
          defaultTab="accounts"
          onChange={setActiveAdminTab}
        >
          {activeAdminTab === 'accounts' && (
            <Tabs.Content>
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
            <Tabs.Content>
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
            <Tabs.Content>
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
```

---

## Phase 6: Implement Policies2 Page

### Step 6.1: Create Policies2 Page

Create `src/app/(dashboard2)/policies2/page.tsx`:

```typescript
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
```

---

## Phase 7: Implement Activity2 Page

### Step 7.1: Create Activity2 Page

Create `src/app/(dashboard2)/activity2/page.tsx`:

```typescript
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
  // ... same items
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
```

---

## Phase 8: Verify Integration

### Step 8.1: Test Routes

After implementing all pages, test the following routes:

```
v1 Routes (unchanged):
http://localhost:3000/dashboard
http://localhost:3000/users
http://localhost:3000/administration
http://localhost:3000/policies
http://localhost:3000/activity

v2 Routes (new):
http://localhost:3000/dashboard2
http://localhost:3000/users2
http://localhost:3000/administration2
http://localhost:3000/policies2
http://localhost:3000/activity2
```

### Step 8.2: Checklist

- [ ] Both v1 and v2 render without errors
- [ ] Navigation works in both versions
- [ ] All data loads correctly
- [ ] Modal dialogs function properly
- [ ] Search and filter work
- [ ] CRUD operations (Create, Read, Update, Delete) work
- [ ] No console errors
- [ ] Styling matches nh.html design

---

## Common Issues & Solutions

### Issue: Components not found

**Solution:** Ensure all imports are correct:
```typescript
import { Button, Card } from '@/components/ui2';
```

### Issue: Colors not applied

**Solution:** Verify theme is imported:
```typescript
import { semanticColors } from '@/components/ui2/theme';
```

### Issue: Modal not closing

**Solution:** Ensure `onClose` prop is passed:
```typescript
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  // ...
/>
```

### Issue: Sidebar not navigating

**Solution:** Connect sidebar to router:
```typescript
const router = useRouter();
const handleNavigation = (itemId: string) => {
  router.push(`/${itemId}`);
};
```

---

## Summary

✅ **Phase 1:** Foundation components copied  
✅ **Phase 2:** Layout wrapper created  
✅ **Phase 3:** Dashboard2 implemented  
✅ **Phase 4:** Users2 implemented  
✅ **Phase 5:** Administration2 implemented  
✅ **Phase 6:** Policies2 implemented  
✅ **Phase 7:** Activity2 implemented  
✅ **Phase 8:** Integration verified  

Both v1 and v2 UIs now run simultaneously in the same application!