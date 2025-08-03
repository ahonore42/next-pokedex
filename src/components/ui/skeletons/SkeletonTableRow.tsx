import React from 'react';
import clsx from 'clsx';
import Skeleton from './Skeleton';
import { Column } from '../tables/tables.config';

interface SkeletonTableRowProps<T> {
  columns: Column<T>[];
  noPadding?: boolean;
  animation?: 'shimmer' | 'pulse';
  className?: string;
}

export default function SkeletonTableRow<T>({
  columns,
  noPadding = false,
  animation = 'shimmer',
  className = '',
}: SkeletonTableRowProps<T>) {
  return (
    <tr 
      className={clsx(
        'theme-transition border-b border-border',
        className
      )}
    >
      {columns.map((column, colIndex) => (
        <td
          key={colIndex}
          className={clsx(
            'text-sm theme-transition align-middle',
            // Handle padding based on noPadding prop
            noPadding ? 'p-0' : 'py-2',
            noPadding ? '' : column.columnPadding || 'px-3',
            column.className || 'font-medium text-center',
          )}
        >
          <Skeleton 
            className="h-4 w-full rounded" 
            animation={animation} 
          />
        </td>
      ))}
    </tr>
  );
}