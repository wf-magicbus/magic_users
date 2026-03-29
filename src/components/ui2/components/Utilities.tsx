'use client';

import React from 'react';
import { semanticColors, radius } from '../theme';

// Info Card Component
export const InfoCard = ({
  icon = 'ℹ️',
  title,
  text,
}: {
  icon?: string;
  title: string;
  text: string;
}) => {
  const cardStyle: React.CSSProperties = {
    background: 'rgba(50, 184, 198, 0.08)',
    border: `1px solid rgba(50, 184, 198, 0.2)`,
    borderRadius: radius.base,
    padding: '16px',
    marginTop: '20px',
    display: 'flex',
    gap: '12px',
  };

  const iconStyle: React.CSSProperties = {
    color: semanticColors.primary,
    fontSize: '20px',
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: semanticColors.text,
    marginBottom: '4px',
  };

  const textStyle: React.CSSProperties = {
    fontSize: '13px',
    color: semanticColors.textSecondary,
    lineHeight: '1.5',
  };

  return (
    <div style={cardStyle}>
      <div style={iconStyle}>{icon}</div>
      <div style={contentStyle}>
        <div style={titleStyle}>{title}</div>
        <div style={textStyle}>{text}</div>
      </div>
    </div>
  );
};

// Empty State Component
export const EmptyState = ({
  icon = '📭',
  title = 'No items found',
  subtitle = 'Try adjusting your search or filters',
}: {
  icon?: string;
  title?: string;
  subtitle?: string;
}) => {
  const containerStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 20px',
    color: semanticColors.textSecondary,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    marginBottom: '8px',
    color: semanticColors.text,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: semanticColors.textSecondary,
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>{icon}</div>
      <div style={titleStyle}>{title}</div>
      <div style={subtitleStyle}>{subtitle}</div>
    </div>
  );
};

// Search & Filter Bar Component
export const SearchFilterBar = ({
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions = [
    { value: 'all', label: 'All Items' },
  ],
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: Array<{ value: string; label: string }>;
}) => {
  const barStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  };

  const searchInputStyle: React.CSSProperties = {
    flex: 1,
    minWidth: '200px',
    padding: '10px 14px 10px 40px',
    border: `1px solid ${semanticColors.border}`,
    borderRadius: radius.base,
    fontSize: '14px',
    background: semanticColors.surface,
    color: semanticColors.text,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23626C71' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '12px center',
  };

  const filterSelectStyle: React.CSSProperties = {
    padding: '10px 14px',
    border: `1px solid ${semanticColors.border}`,
    borderRadius: radius.base,
    fontSize: '14px',
    background: semanticColors.surface,
    color: semanticColors.text,
    minWidth: '150px',
  };

  return (
    <div style={barStyle}>
      <input
        type="text"
        placeholder="Search..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        style={searchInputStyle}
      />
      {onFilterChange && (
        <select
          value={filterValue || 'all'}
          onChange={(e) => onFilterChange(e.target.value)}
          style={filterSelectStyle}
        >
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

// Stats Card Component
export const StatsCard = ({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string | number;
  subtext?: string;
}) => {
  const cardStyle: React.CSSProperties = {
    flex: 1,
    minWidth: '220px',
    background: 'rgba(50, 184, 198, 0.06)',
    borderRadius: radius.base,
    border: `1px solid rgba(50, 184, 198, 0.18)`,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: semanticColors.textSecondary,
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: semanticColors.text,
  };

  const subtextStyle: React.CSSProperties = {
    fontSize: '11px',
    color: semanticColors.textSecondary,
  };

  return (
    <div style={cardStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
      {subtext && <div style={subtextStyle}>{subtext}</div>}
    </div>
  );
};

// Loading Spinner Component
export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = { sm: 20, md: 40, lg: 60 };
  const dimension = sizeMap[size];

  const spinnerStyle: React.CSSProperties = {
    width: dimension,
    height: dimension,
    border: `3px solid rgba(50, 184, 198, 0.2)`,
    borderTop: `3px solid ${semanticColors.primary}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={spinnerStyle} />
    </>
  );
};

// Loading State Overlay
export const LoadingOverlay = ({ message = 'Loading...' }) => {
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    flexDirection: 'column',
    gap: '16px',
  };

  const messageStyle: React.CSSProperties = {
    color: semanticColors.text,
    fontSize: '14px',
  };

  return (
    <div style={overlayStyle}>
      <Spinner size="lg" />
      <div style={messageStyle}>{message}</div>
    </div>
  );
};

// Confirmation Dialog Component
export const ConfirmationDialog = ({
  title = 'Confirm Action',
  message = 'Are you sure?',
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}: {
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}) => {
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const dialogStyle: React.CSSProperties = {
    background: semanticColors.surface,
    borderRadius: radius.lg,
    padding: '28px',
    maxWidth: '400px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)',
    border: `1px solid ${semanticColors.cardBorder}`,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 600,
    color: semanticColors.text,
    marginBottom: '8px',
  };

  const messageStyle: React.CSSProperties = {
    fontSize: '14px',
    color: semanticColors.textSecondary,
    marginBottom: '20px',
  };

  const buttonsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  };

  const buttonStyle = (dangerous: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    borderRadius: radius.base,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const confirmButtonStyle: React.CSSProperties = {
    ...buttonStyle(isDangerous),
    background: isDangerous ? semanticColors.error : semanticColors.primary,
    color: 'white',
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...buttonStyle(false),
    background: 'rgba(94, 82, 64, 0.12)',
    color: semanticColors.text,
  };

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={titleStyle}>{title}</div>
        <div style={messageStyle}>{message}</div>
        <div style={buttonsStyle}>
          <button style={cancelButtonStyle} onClick={onCancel}>
            {cancelText}
          </button>
          <button style={confirmButtonStyle} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Divider Component
export const Divider = ({
  margin = '20px 0',
}: {
  margin?: string;
}) => {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: `1px solid ${semanticColors.cardBorder}`,
        margin,
      }}
    />
  );
};

// Checkbox Component
export const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    background: 'rgba(50, 184, 198, 0.05)',
    borderRadius: radius.base,
    border: `1px solid rgba(50, 184, 198, 0.15)`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  const checkboxStyle: React.CSSProperties = {
    width: '18px',
    height: '18px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    accentColor: semanticColors.primary,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: semanticColors.text,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  return (
    <label style={containerStyle}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={checkboxStyle}
      />
      <span style={labelStyle}>{label}</span>
    </label>
  );
};

// Error Message Component
export const ErrorMessage = ({ message }: { message: string }) => {
  const containerStyle: React.CSSProperties = {
    background: 'rgba(255, 84, 89, 0.1)',
    border: `1px solid rgba(255, 84, 89, 0.3)`,
    borderRadius: radius.base,
    padding: '12px 16px',
    color: semanticColors.error,
    fontSize: '13px',
    marginTop: '12px',
  };

  return <div style={containerStyle}>{message}</div>;
};

// Success Message Component
export const SuccessMessage = ({ message }: { message: string }) => {
  const containerStyle: React.CSSProperties = {
    background: 'rgba(50, 184, 198, 0.1)',
    border: `1px solid rgba(50, 184, 198, 0.3)`,
    borderRadius: radius.base,
    padding: '12px 16px',
    color: semanticColors.success,
    fontSize: '13px',
    marginTop: '12px',
  };

  return <div style={containerStyle}>{message}</div>;
};
