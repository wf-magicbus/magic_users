'use client';

import React from 'react';
import { semanticColors, shadows, radius } from '../theme';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  description?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
  variant?: 'default' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      title,
      description,
      header,
      footer,
      noPadding = false,
      variant = 'default',
      style,
      ...props
    },
    ref
  ) => {
    const cardStyle: React.CSSProperties = {
      ...style,
      background: semanticColors.surface,
      border: `1px solid ${semanticColors.cardBorder}`,
      borderRadius: radius.lg,
      overflow: 'hidden',
      boxShadow: variant === 'elevated' ? shadows.md : shadows.sm,
      transition: 'all 0.2s ease',
    };

    return (
      <div ref={ref} style={cardStyle} {...props}>
        {/* Header Section */}
        {(title || description || header) && (
          <div
            style={{
              padding: '14px 20px',
              borderBottom: `1px solid ${semanticColors.cardBorder}`,
              display: header ? 'block' : 'block',
            }}
          >
            {header ? (
              header
            ) : (
              <>
                {title && (
                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: semanticColors.text,
                      margin: 0,
                      marginBottom: description ? '6px' : 0,
                    }}
                  >
                    {title}
                  </h3>
                )}
                {description && (
                  <p
                    style={{
                      fontSize: '14px',
                      color: semanticColors.textSecondary,
                      margin: 0,
                    }}
                  >
                    {description}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Body Section */}
        <div style={{ padding: noPadding ? 0 : '16px 20px' }}>
          {children}
        </div>

        {/* Footer Section */}
        {footer && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: `1px solid ${semanticColors.cardBorder}`,
              background: `rgba(0, 0, 0, 0.1)`,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';
