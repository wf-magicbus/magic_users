import React from 'react';
import { semanticColors } from '@/components/ui2/theme';

export default function Dashboard2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: semanticColors.background,
      }}
    >
      {children}
    </div>
  );
}