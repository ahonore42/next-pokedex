import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import SquareTable from './SquareTable';

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

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  maxColumns?: number;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
  overlayHover?: boolean;
  noPadding?: boolean;
  square?: string;
}

export default function DataTable<T>({
  data,
  columns,
  maxColumns = 12,
  initialSortBy = undefined,
  initialSortOrder = 'asc',
  overlayHover = false,
  noPadding = false,
  square,
}: DataTableProps<T>) {
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    const newSortKey = column.header as string;
    if (sortBy === newSortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortKey);
      setSortOrder('desc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortBy) return data;

    const sorted = [...data].sort((a, b) => {
      let valA: any;
      let valB: any;

      const column = columns.find((col) => col.header === sortBy);

      if (!column) {
        return 0;
      }

      const effectiveSortKey = column.sortKey || column.accessor;

      if (typeof effectiveSortKey === 'function') {
        valA = effectiveSortKey(a);
        valB = effectiveSortKey(b);
      } else {
        valA = a[effectiveSortKey];
        valB = b[effectiveSortKey];
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
    return sorted;
  }, [data, sortBy, sortOrder, columns]);

  const visibleColumns = columns.slice(0, maxColumns);

  return (
    <div className={clsx('flex flex-col', square ? 'w-fit' : 'w-full')}>
      <SquareTable
        sortedData={sortedData}
        visibleColumns={visibleColumns}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        overlayHover={overlayHover}
        noPadding={noPadding}
        square={square}
      />
    </div>
  );
}
