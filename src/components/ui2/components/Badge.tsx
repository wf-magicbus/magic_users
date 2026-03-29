'use client';

import React from 'react';
import { semanticColors, radius } from '../theme';

export type BadgeStatus = 'active' | 'locked' | 'disabled' | 'pending' | 'expired';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  status?: BadgeStatus;
  variant?: 'solid' | 'outline';
}

const getStatusStyles = (status: BadgeStatus, variant: 'solid' | 'outline') => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: variant === 'solid' ? '5px 12px' : '4px 11px',
    borderRadius: radius.full,
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3px',
  };

  switch (status) {
    case 'active':
      return {
        ...baseStyles,
        background: variant === 'solid' ? 'rgba(50, 184, 198, 0.12)' : 'transparent',
        color: semanticColors.success,
        border: variant === 'outline' ? `1px solid rgba(50, 184, 198, 0.25)` : 'none',
      };
    case 'locked':
      return {
        ...baseStyles,
        background: variant === 'solid' ? 'rgba(192, 21, 47, 0.12)' : 'transparent',
        color: semanticColors.error,
        border: variant === 'outline' ? `1px solid rgba(192, 21, 47, 0.25)` : 'none',
      };
    case 'disabled':
      return {
        ...baseStyles,
        background: variant === 'solid' ? 'rgba(119, 124, 124, 0.08)' : 'transparent',
        color: semanticColors.textSecondary,
        border: variant === 'outline' ? `1px solid rgba(119, 124, 124, 0.2)` : 'none',
      };
    case 'pending':
      return {
        ...baseStyles,
        background: variant === 'solid' ? 'rgba(168, 75, 47, 0.12)' : 'transparent',
        color: semanticColors.warning,
        border: variant === 'outline' ? `1px solid rgba(168, 75, 47, 0.25)` : 'none',
      };
    case 'expired':
      return {
        ...baseStyles,
        background: variant === 'solid' ? 'rgba(230, 129, 97, 0.12)' : 'transparent',
        color: semanticColors.warning,
        border: variant === 'outline' ? `1px solid rgba(230, 129, 97, 0.25)` : 'none',
      };
    default:
      return baseStyles;
  }
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, status = 'active', variant = 'solid', style, ...props }, ref) => {
    const badgeStyle: React.CSSProperties = {
      ...getStatusStyles(status, variant),
      ...style,
    };

    return (
      <span ref={ref} style={badgeStyle} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Status dot indicator
export const StatusDot = ({ status }: { status: BadgeStatus }) => {
  const getDotColor = () => {
    switch (status) {
      case 'active':
        return '#22c55e';
      case 'locked':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      case 'expired':
        return '#f59e0b';
      case 'disabled':
        return '#94a3b8';
      default:
        return '#94a3b8';
    }
  };

  return (
    <span
      style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        display: 'inline-block',
        background: getDotColor(),
        marginRight: '6px',
      }}
    />
  );
};
