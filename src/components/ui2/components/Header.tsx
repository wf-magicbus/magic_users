'use client';

import React from 'react';
import { semanticColors, shadows, radius } from '../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
}

export const Header = ({ title, subtitle, rightContent }: HeaderProps) => {
  const headerStyle: React.CSSProperties = {
    background: semanticColors.surface,
    borderBottom: `1px solid ${semanticColors.cardBorder}`,
    padding: '20px 32px',
    boxShadow: shadows.sm,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const headerContentStyle: React.CSSProperties = {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const headerIconStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    background: `linear-gradient(135deg, ${semanticColors.primary}, ${semanticColors.primaryHover})`,
    borderRadius: radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 600,
    fontSize: '18px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 600,
    color: semanticColors.text,
    margin: 0,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '13px',
    color: semanticColors.textSecondary,
    marginTop: '2px',
  };

  return (
    <header style={headerStyle}>
      <div style={headerContentStyle}>
        <div style={titleSectionStyle}>
          <div style={headerIconStyle}>🔐</div>
          <div>
            <h1 style={titleStyle}>{title}</h1>
            {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
          </div>
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </header>
  );
};
