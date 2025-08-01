import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import TableColumn, { Column } from './TableColumn';
import TableRow from './TableRow';

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  maxColumns?: number;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
  overlayHover?: boolean;
  noPadding?: boolean;
  border?: boolean;
  rounded?: boolean;
}

export default function DataTable<T>({
  data,
  columns,
  maxColumns = 12,
  initialSortBy = undefined,
  initialSortOrder = 'asc',
  overlayHover = false,
  noPadding = false,
  border = false,
  rounded = false,
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
    <div
      className={clsx(
        'flex flex-col w-full',
        rounded && 'rounded-lg overflow-scroll',
        border && 'border-2 border-border',
      )}
    >
      <table className="border-collapse divide-y divide-border">
        {/* TABLE HEADER - Column definitions */}
        <thead>
          <tr className="border-b-2 border-border theme-transition">
            {visibleColumns.map((column, index) => (
              <TableColumn
                key={index}
                column={column}
                index={index}
                visibleColumnsLength={visibleColumns.length}
                sortBy={sortBy}
                onSort={handleSort}
                noPadding={noPadding}
              />
            ))}
          </tr>
        </thead>

        {/* TABLE BODY - Data rows */}
        <tbody className="">
          {sortedData.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              row={row}
              rowIndex={rowIndex}
              visibleColumns={visibleColumns}
              sortedDataLength={sortedData.length}
              overlayHover={overlayHover}
              noPadding={noPadding}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
