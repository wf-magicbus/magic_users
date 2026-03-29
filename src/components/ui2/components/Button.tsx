'use client';

import React from 'react';
import { semanticColors, radius } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return `
        background: ${semanticColors.primary};
        color: white;
        &:hover:not(:disabled) {
          background: ${semanticColors.primaryHover};
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
        }
      `;
    case 'secondary':
      return `
        background: rgba(94, 82, 64, 0.12);
        color: ${semanticColors.text};
        border: 1px solid ${semanticColors.border};
        &:hover:not(:disabled) {
          background: rgba(94, 82, 64, 0.2);
        }
      `;
    case 'danger':
      return `
        background: ${semanticColors.error};
        color: white;
        &:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
      `;
    case 'success':
      return `
        background: ${semanticColors.success};
        color: white;
        &:hover:not(:disabled) {
          opacity: 0.9;
        }
      `;
    default:
      return '';
  }
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return `
        padding: 5px 12px;
        font-size: 12px;
      `;
    case 'lg':
      return `
        padding: 12px 24px;
        font-size: 15px;
      `;
    case 'md':
    default:
      return `
        padding: 10px 20px;
        font-size: 14px;
      `;
  }
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      icon,
      loading = false,
      disabled = false,
      fullWidth = false,
      style,
      ...props
    },
    ref
  ) => {
    const buttonStyle: React.CSSProperties = {
      ...style,
      display: fullWidth ? 'block' : 'inline-flex',
      width: fullWidth ? '100%' : 'auto',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      border: 'none',
      borderRadius: radius.base,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      fontWeight: 500,
      opacity: disabled || loading ? 0.5 : 1,
      transition: 'all 0.2s ease',
    };

    const variantStyles = getVariantStyles(variant);
    const sizeStyles = getSizeStyles(size);

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={buttonStyle as any}
        {...props}
      >
        {icon && <span>{icon}</span>}
        {children}
        {loading && <span>...</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
