'use client';

import React from 'react';
import { semanticColors, shadows, radius } from '../theme';

interface TableProps {
  children: React.ReactNode;
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
}

interface TableHeadProps {
  children: React.ReactNode;
}

interface TableBodyProps {
  children: React.ReactNode;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  header?: boolean;
}

interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  header?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

const TableComponent: React.FC<TableProps> & {
  Head: React.FC<TableHeadProps>;
  Body: React.FC<TableBodyProps>;
  Row: React.FC<TableRowProps>;
  Cell: React.FC<TableCellProps>;
} = ({ children, striped = false, hover = true, compact = false }) => {
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    borderSpacing: 0,
  };

  const containerStyle: React.CSSProperties = {
    overflow: 'auto',
    marginTop: '20px',
    borderRadius: radius.base,
    border: `1px solid ${semanticColors.cardBorder}`,
    boxShadow: shadows.sm,
  };

  return (
    <div style={containerStyle}>
      <table style={tableStyle}>{children}</table>
    </div>
  );
};

const TableHead: React.FC<TableHeadProps> = ({ children }) => {
  const headStyle: React.CSSProperties = {
    background: `rgba(50, 184, 198, 0.08)`,
  };

  return <thead style={headStyle}>{children}</thead>;
};

const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <tbody>{children}</tbody>;
};

const TableRow: React.FC<TableRowProps> = ({ children, header = false, ...props }) => {
  const rowStyle: React.CSSProperties = {
    transition: 'background 0.2s ease',
    borderBottom: `1px solid ${semanticColors.cardBorder}`,
  };

  return (
    <tr style={rowStyle} {...props}>
      {children}
    </tr>
  );
};

const TableCell: React.FC<TableCellProps> = ({
  children,
  header = false,
  align = 'left',
  width,
  ...props
}) => {
  const cellStyle: React.CSSProperties = {
    padding: header ? '14px 16px' : '12px 16px',
    textAlign: align as any,
    fontSize: header ? '12px' : '13px',
    fontWeight: header ? 600 : 400,
    color: header ? semanticColors.text : semanticColors.text,
    borderBottom: `1px solid ${semanticColors.cardBorder}`,
    width,
    verticalAlign: 'middle',
  };

  if (header) {
    return (
      <th style={cellStyle} {...props}>
        {children}
      </th>
    );
  }

  return (
    <td style={cellStyle} {...props}>
      {children}
    </td>
  );
};

// Attach sub-components
TableComponent.Head = TableHead;
TableComponent.Body = TableBody;
TableComponent.Row = TableRow;
TableComponent.Cell = TableCell;

export const Table = TableComponent;
