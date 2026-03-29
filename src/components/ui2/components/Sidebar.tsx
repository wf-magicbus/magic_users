'use client';

import React from 'react';
import { semanticColors, radius } from '../theme';

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  section?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (id: string) => void;
  branding?: {
    logo?: React.ReactNode;
    title: string;
  };
}

export const Sidebar = ({
  items,
  activeItem,
  onItemClick,
  branding,
}: SidebarProps) => {
  const sidebarStyle: React.CSSProperties = {
    width: '185px',
    flexShrink: 0,
    marginRight: '20px',
  };

  const brandingStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 700,
    color: semanticColors.text,
    padding: '12px 12px 4px',
    marginBottom: '12px',
  };

  const sectionStyle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 700,
    color: semanticColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    padding: '12px 12px 4px',
    marginTop: '8px',
  };

  const navItemStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    borderRadius: radius.md,
    cursor: 'pointer',
    marginBottom: '1px',
    fontSize: '13px',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? semanticColors.text : semanticColors.textSecondary,
    background: isActive ? '#fff' : 'transparent',
    border: isActive ? `1px solid ${semanticColors.border}` : '1px solid transparent',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  });

  const groupedItems: { [key: string]: SidebarItem[] } = {};

  items.forEach((item) => {
    const section = item.section || 'default';
    if (!groupedItems[section]) {
      groupedItems[section] = [];
    }
    groupedItems[section].push(item);
  });

  const sections = Object.keys(groupedItems);

  return (
    <nav style={sidebarStyle}>
      {branding && <div style={brandingStyle}>{branding.title}</div>}

      {sections.map((section, index) => (
        <div key={section}>
          {section !== 'default' && (
            <div style={sectionStyle}>{section}</div>
          )}
          {groupedItems[section].map((item) => (
            <div
              key={item.id}
              style={navItemStyle(activeItem === item.id)}
              onClick={() => onItemClick?.(item.id)}
              role="button"
              tabIndex={0}
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
};
