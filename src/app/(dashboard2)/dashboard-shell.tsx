'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export const DASHBOARD2_TABS = [
  { id: 'users2', label: 'Users', icon: '◉', route: '/users2' },
  { id: 'policies2', label: 'Policies', icon: '◆', route: '/policies2' },
  { id: 'administration2', label: 'Groups', icon: '▣', route: '/administration2' },
  { id: 'activity2', label: 'Active Sessions', icon: '◌', route: '/activity2' },
] as const;

export type Dashboard2TabId = (typeof DASHBOARD2_TABS)[number]['id'];

export function DashboardShell({
  activeTab,
  children,
  headerActions,
}: {
  activeTab: Dashboard2TabId;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <div className="header-icon">SPA</div>
            <div>
              <h1>Security Policy Admin Console</h1>
              <div className="header-subtitle">
                Enterprise user management, policy control, and session governance
              </div>
            </div>
          </div>
          {headerActions ? <div>{headerActions}</div> : null}
        </div>
      </header>

      <main className="main-content">
        <div className="tabs-container" role="tablist" aria-label="Dashboard sections">
          {DASHBOARD2_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => router.push(tab.route)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {children}
      </main>
    </div>
  );
}

export function StatusBadge({
  status,
  children,
}: {
  status: 'active' | 'locked' | 'pending' | 'disabled' | 'expired' | 'terminated';
  children?: React.ReactNode;
}) {
  const kind =
    status === 'active'
      ? 'active'
      : status === 'locked' || status === 'terminated' || status === 'disabled'
        ? 'locked'
        : 'pending';

  return (
    <span className={`status-badge status-${kind}`}>
      <span className={`dot dot-${kind === 'active' ? 'green' : kind === 'locked' ? 'red' : 'yellow'}`} />
      {children ?? status}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-text">{title}</div>
      <div className="empty-state-subtext">{subtitle}</div>
    </div>
  );
}

export function InfoCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="info-card">
      <div className="info-icon">{icon}</div>
      <div className="info-content">
        <div className="info-title">{title}</div>
        <div className="info-text">{text}</div>
      </div>
    </div>
  );
}

export function formatDateTime(value?: string | null) {
  if (!value) return 'Never';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

export function formatDate(value?: string | null) {
  if (!value) return 'Not available';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
}

export function slugToLabel(value?: string | null) {
  if (!value) return 'Unassigned';

  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
