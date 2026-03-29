'use client';

import React, { useState } from 'react';
import { semanticColors } from '../theme';

interface Layout2Props {
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export const Layout2 = ({ header, sidebar, children }: Layout2Props) => {
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: semanticColors.background,
    display: 'flex',
    flexDirection: 'column',
  };

  const contentWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flex: 1,
  };

  const mainContentStyle: React.CSSProperties = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px',
    flex: 1,
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
  };

  return (
    <div style={containerStyle}>
      {header}
      <div style={contentWrapperStyle}>
        {sidebar && sidebar}
        <div style={mainContentStyle}>{children}</div>
      </div>
    </div>
  );
};
