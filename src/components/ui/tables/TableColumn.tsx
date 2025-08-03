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
  fixedWidth?: string; // Tailwind width class for horizontal layout stabilization
}

export default function TableColumn<T>({
  column,
  index,
  visibleColumnsLength,
  sortBy,
  onSort,
  noPadding = false,
  square,
  fixedWidth,
}: TableColumnProps<T>) {
  const isActive = sortBy === column.header;
  const isClickable = column.sortable && onSort;

  return (
    <th
      className={clsx(
        'text-sm font-semibold theme-transition',
        noPadding ? 'p-0' : 'py-2',
        noPadding ? '' : column.columnPadding || 'px-3',
        column.headerClassName || 'text-center',
        column.noWrap && 'whitespace-nowrap',
        isClickable && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50',
        isActive && 'bg-indigo-50 dark:bg-indigo-900/50',
        // Column dividers for square tables
        square && index < visibleColumnsLength - 1 && 'border-r border-border',
        // Regular dividers for non-square tables
        !square && column.dividerAfter && 'border-r-2 border-border',
        !square && column.dividerBefore && 'border-l-2 border-border',
        // Fixed width to prevent horizontal layout shifts
        fixedWidth && fixedWidth,
        // Ensure content doesn't overflow when width is fixed
        fixedWidth && 'overflow-hidden text-ellipsis',
      )}
      onClick={() => isClickable && onSort(column)}
    >
      <div
        className={clsx(
          'flex items-center',
          column.headerAlignment === 'left' && 'justify-start',
          column.headerAlignment === 'right' && 'justify-end',
          (!column.headerAlignment || column.headerAlignment === 'center') && 'justify-center',
          // Prevent header text overflow when using fixed widths
          fixedWidth && 'overflow-hidden text-ellipsis whitespace-nowrap',
        )}
      >
        {column.header}
      </div>
    </th>
  );
}
