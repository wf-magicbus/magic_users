'use client';

import React from 'react';
import { semanticColors } from '@/components/ui2/theme';

export default function Dashboard2Layout({ children }: { children: React.ReactNode }) {
  const layoutStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: semanticColors.background,
  };

  return (
    <html lang="en">
      <body style={layoutStyle}>
        {children}
      </body>
    </html>
  );
}