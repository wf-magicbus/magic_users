'use client';

import React, { useEffect } from 'react';
import { semanticColors, radius, shadows } from '../theme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdropClick?: boolean;
}

const getSizeStyles = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return { maxWidth: '400px' };
    case 'lg':
      return { maxWidth: '700px' };
    case 'md':
    default:
      return { maxWidth: '600px' };
  }
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
    animation: 'fadeIn 0.2s ease',
  };

  const modalStyle: React.CSSProperties = {
    background: semanticColors.surface,
    borderRadius: radius.lg,
    padding: '28px',
    width: '90%',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: shadows.lg,
    border: `1px solid ${semanticColors.cardBorder}`,
    animation: 'slideUp 0.3s ease',
    ...getSizeStyles(size),
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${semanticColors.cardBorder}`,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 600,
    color: semanticColors.text,
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    border: 'none',
    background: 'rgba(94, 82, 64, 0.08)',
    borderRadius: radius.base,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: semanticColors.textSecondary,
    fontSize: '20px',
    lineHeight: 1,
    transition: 'all 0.2s ease',
  };

  const contentStyle: React.CSSProperties = {
    marginBottom: footer ? '20px' : 0,
  };

  const footerStyle: React.CSSProperties = {
    paddingTop: '16px',
    borderTop: `1px solid ${semanticColors.cardBorder}`,
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div style={overlayStyle} onClick={handleBackdropClick}>
        <div style={modalStyle}>
          {title && (
            <div style={headerStyle}>
              <h2 style={titleStyle}>{title}</h2>
              <button
                style={closeButtonStyle}
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
          )}
          <div style={contentStyle}>{children}</div>
          {footer && <div style={footerStyle}>{footer}</div>}
        </div>
      </div>
    </>
  );
};
