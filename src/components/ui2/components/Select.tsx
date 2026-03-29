'use client';

import React from 'react';
import { semanticColors, radius } from '../theme';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  hint?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      hint,
      error,
      helperText,
      fullWidth = true,
      disabled = false,
      placeholder,
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
    };

    const selectStyle: React.CSSProperties = {
      ...style,
      padding: '10px 14px',
      border: `1px solid ${semanticColors.border}`,
      borderRadius: radius.base,
      fontSize: '14px',
      background: semanticColors.surface,
      color: semanticColors.text,
      width: '100%',
      boxSizing: 'border-box',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    };

    const hintStyle: React.CSSProperties = {
      fontSize: '12px',
      color: semanticColors.textSecondary,
    };

    const errorStyle: React.CSSProperties = {
      fontSize: '12px',
      color: semanticColors.error,
    };

    return (
      <div style={containerStyle}>
        {label && <label style={labelStyle}>{label}</label>}
        <select
          ref={ref}
          disabled={disabled}
          style={{
            ...selectStyle,
            borderColor: error ? semanticColors.error : semanticColors.border,
          }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span style={errorStyle}>{error}</span>}
        {helperText && !error && <span style={hintStyle}>{helperText}</span>}
        {hint && !error && !helperText && <span style={hintStyle}>{hint}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
