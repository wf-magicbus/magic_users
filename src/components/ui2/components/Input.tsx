'use client';

import React from 'react';
import { semanticColors, radius } from '../theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      helperText,
      fullWidth = true,
      disabled = false,
      style,
      ...props
    },
    ref
  ) => {
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: fullWidth ? '100%' : 'auto',
    };

    const labelStyle: React.CSSProperties = {
      fontSize: '13px',
      fontWeight: 500,
      color: semanticColors.text,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    };

    const inputStyle: React.CSSProperties = {
      ...style,
      padding: '10px 14px',
      border: `1px solid ${semanticColors.border}`,
      borderRadius: radius.base,
      fontSize: '14px',
      background: semanticColors.surface,
      color: semanticColors.text,
      width: '100%',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'text',
    };

    const hintStyle: React.CSSProperties = {
      fontSize: '12px',
      color: semanticColors.textSecondary,
      marginTop: '4px',
    };

    const errorStyle: React.CSSProperties = {
      fontSize: '12px',
      color: semanticColors.error,
      marginTop: '4px',
    };

    return (
      <div style={containerStyle}>
        {label && <label style={labelStyle}>{label}</label>}
        <input
          ref={ref}
          disabled={disabled}
          style={{
            ...inputStyle,
            borderColor: error ? semanticColors.error : semanticColors.border,
          }}
          {...props}
        />
        {error && <span style={errorStyle}>{error}</span>}
        {helperText && !error && <span style={hintStyle}>{helperText}</span>}
        {hint && !error && !helperText && <span style={hintStyle}>{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
