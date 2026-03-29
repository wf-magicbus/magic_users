'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/lib/use-auth-guard';
import {
  Card,
  Button,
  Badge,
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
  InfoCard,
} from '@/components/ui2/components/Utilities';
import { mockUsers } from '@/lib/mock-data';

const NAV_ITEMS = [
  { id: 'dashboard2', label: 'Dashboard', icon: '📊', section: 'Main', route: '/dashboard2' },
  { id: 'users2', label: 'Users', icon: '👥', section: 'Main', route: '/users2' },
  { id: 'administration2', label: 'Administration', icon: '⚙️', section: 'Main', route: '/administration2' },
  { id: 'policies2', label: 'Policies', icon: '🔒', section: 'Policies', route: '/policies2' },
  { id: 'activity2', label: 'Activity', icon: '📋', section: 'Monitor', route: '/activity2' },
];

interface UserFormData {
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function Users2Page() {
  // State management
  const router = useRouter();
  const { loading } = useAuthGuard();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

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

  const handleSaveUser = (user: UserFormData) => {
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: '', status: 'active' });
    setEditingUserId(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <Layout2
      header={<Header title="Magic Users" subtitle="Admin Dashboard v2" />}
      sidebar={
        <Sidebar
          items={NAV_ITEMS}
          activeItem="users2"
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
          User Management
        </h1>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px 14px',
              border: `1px solid rgba(119, 124, 124, 0.3)`,
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'rgba(38, 40, 40, 1)',
              color: 'rgba(245, 245, 245, 1)',
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              border: `1px solid rgba(119, 124, 124, 0.3)`,
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'rgba(38, 40, 40, 1)',
              color: 'rgba(245, 245, 245, 1)',
              minWidth: '150px',
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
            <option value="pending">Pending</option>
          </select>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            + Add User
          </Button>
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState
            icon="👤"
            title="No users found"
            subtitle="Try adjusting your search or filters"
          />
        ) : (
          <Card title="Users List">
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: 'rgba(33, 128, 141, 0.08)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid rgba(119, 124, 124, 0.2)' }}>
                      Name
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid rgba(119, 124, 124, 0.2)' }}>
                      Email
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid rgba(119, 124, 124, 0.2)' }}>
                      Role
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid rgba(119, 124, 124, 0.2)' }}>
                      Status
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid rgba(119, 124, 124, 0.2)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid rgba(119, 124, 124, 0.2)' }}>
                      <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                        <strong>{user.name}</strong>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px' }}>{user.email}</td>
                      <td style={{ padding: '14px 16px', fontSize: '14px' }}>{user.role}</td>
                      <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                        <Badge
                          status={
                            user.status === 'active'
                              ? 'active'
                              : user.status === 'locked'
                              ? 'locked'
                              : 'pending'
                          }
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenModal(user)}
                          style={{ marginRight: '8px' }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <Card title={editingUserId ? 'Edit User' : 'Add User'}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <Select
                  label="Role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  options={[
                    { label: 'Admin', value: 'admin' },
                    { label: 'User', value: 'user' },
                    { label: 'Auditor', value: 'auditor' },
                  ]}
                />
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Locked', value: 'locked' },
                    { label: 'Pending', value: 'pending' },
                  ]}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button
                    variant="primary"
                    onClick={() => handleSaveUser(formData)}
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <InfoCard
          icon="ℹ️"
          title="User Management"
          text="Manage user accounts and their roles. Locked accounts require manual unlock by an administrator."
        />
      </div>
    </Layout2>
  );
}