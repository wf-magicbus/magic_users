'use client';

import React, { useState } from 'react';
import { semanticColors, radius } from '../theme';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  children: React.ReactNode;
}

interface TabContentProps {
  tabId: string;
  children: React.ReactNode;
}

const TabsComponent: React.FC<TabsProps> & {
  Content: React.FC<TabContentProps>;
} = ({ tabs, defaultTab, onChange, children }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const containerStyle: React.CSSProperties = {
    background: semanticColors.surface,
    borderRadius: radius.lg,
    padding: '8px',
    display: 'inline-flex',
    gap: '4px',
    boxShadow: `0 1px 3px rgba(0, 0, 0, 0.04)`,
    marginBottom: '32px',
    border: `1px solid ${semanticColors.cardBorder}`,
  };

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    background: isActive ? semanticColors.primary : 'transparent',
    border: 'none',
    borderRadius: radius.base,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? 'white' : semanticColors.textSecondary,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: isActive ? `0 1px 3px rgba(0, 0, 0, 0.04)` : 'none',
  });

  const contentWrapperStyle: React.CSSProperties = {
    width: '100%',
  };

  return (
    <>
      <div style={containerStyle}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            style={tabButtonStyle(activeTab === tab.id)}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      <div style={contentWrapperStyle}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === TabContent) {
            return activeTab === child.props.tabId ? child : null;
          }
          return null;
        })}
      </div>
    </>
  );
};

const TabContent: React.FC<TabContentProps> = ({ children }) => {
  return <>{children}</>;
};

TabsComponent.Content = TabContent;

export const Tabs = TabsComponent;
