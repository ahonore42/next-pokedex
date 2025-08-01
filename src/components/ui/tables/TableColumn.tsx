import React from 'react';
import clsx from 'clsx';
import { Column } from './tables.config';

interface TableColumnProps<T> {
  column: Column<T>;
  index: number;
  visibleColumnsLength: number;
  sortBy?: string;
  onSort?: (column: Column<T>) => void;
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
        'text-primary theme-transition',
        !square && 'px-0.5',
        // Apply text alignment based on headerAlignment prop
        !square && column.headerAlignment === 'left'
          ? 'text-left'
          : !square && column.headerAlignment === 'right'
            ? 'text-right'
            : 'text-center', // default to center
        // Bold font for active sort column, semibold for others
        isActiveSortColumn ? 'font-bold' : 'font-semibold',
        noPadding ? 'p-0' : 'py-4',
        noPadding ? '' : column.columnPadding || 'px-3',
        column.headerClassName,
        column.sortable && 'cursor-pointer hover:text-brand',
        // Column dividers for square tables - between headers but not on edges
        square && index < visibleColumnsLength - 1 && 'border-r border-border text-center',
        // Regular dividers for non-square tables
        !square && column.dividerAfter && 'border-r-2 border-border',
      )}
      onClick={() => onSort && onSort(column)}
    >
      <span>{column.header}</span>
    </th>
  );
}
