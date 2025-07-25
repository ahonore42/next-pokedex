import React from 'react';
import clsx from 'clsx';

export interface Column<T> {
  header: string | React.ReactNode;
  accessor: keyof T | ((data: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
  headerAlignment?: 'left' | 'center' | 'right';
  noWrap?: boolean;
  sortable?: boolean;
  sortKey?: keyof T | ((data: T) => any);
  rowspan?: (data: T, index: number) => number | undefined;
  colspan?: (data: T, index: number) => number | undefined;
  skipRender?: (data: T, index: number) => boolean;
  dividerAfter?: boolean;
  dividerBefore?: boolean | ((data: T) => boolean);
  columnPadding?: string;
  cellStyle?: (
    data: T,
    rowIndex: number,
  ) =>
    | {
        className?: string;
        style?: React.CSSProperties;
        wrapper?: (content: React.ReactNode) => React.ReactNode;
      }
    | undefined;
}

interface TableColumnProps<T> {
  column: Column<T>;
  index: number;
  visibleColumnsLength: number;
  sortBy?: string;
  onSort: (column: Column<T>) => void;
  noPadding?: boolean;
  square?: string;
}

export default function TableColumn<T>({
  column,
  index,
  visibleColumnsLength,
  sortBy,
  onSort,
  noPadding = false,
  square,
}: TableColumnProps<T>) {
  const isActiveSortColumn = sortBy === column.header;

  return (
    <th
      className={clsx(
        'text-primary theme-transition px-0.5',
        // Apply text alignment based on headerAlignment prop
        column.headerAlignment === 'left'
          ? 'text-left'
          : column.headerAlignment === 'right'
            ? 'text-right'
            : 'text-left', // default to left
        // Bold font for active sort column, semibold for others
        isActiveSortColumn ? 'font-bold' : 'font-semibold',
        noPadding ? 'p-0' : 'py-4',
        noPadding ? '' : column.columnPadding || 'px-3',
        column.headerClassName,
        column.sortable && 'cursor-pointer hover:text-brand',
        // Column dividers for square tables - between headers but not on edges
        square && index < visibleColumnsLength - 1 && 'border-r border-border',
        // Regular dividers for non-square tables
        !square && column.dividerAfter && 'border-r-2 border-border',
      )}
      onClick={() => onSort(column)}
    >
      <span>{column.header}</span>
    </th>
  );
}
