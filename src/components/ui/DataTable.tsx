import React, { useState, useMemo } from 'react';
import clsx from 'clsx';

export interface Column<T> {
  header: string | React.ReactNode;
  accessor: keyof T | ((data: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
  noWrap?: boolean;
  sortable?: boolean;
  sortKey?: keyof T | ((data: T) => any);
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  maxColumns?: number; // Maximum number of columns to display
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
}

export function DataTable<T>({
  data,
  columns,
  maxColumns = 12,
  initialSortBy = undefined,
  initialSortOrder = 'asc',
}: DataTableProps<T>) {
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  const sortableColumns = useMemo(() => {
    return columns.filter((column) => column.sortable);
  }, [columns]);

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

      const column = columns.find(col => col.header === sortBy);

      if (!column) {
        // If column is not found, return 0 to maintain original order or handle as an error
        return 0;
      }

      // Determine the actual key or function to use for sorting
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
    <div className="flex flex-col gap-4 w-full">
      {(initialSortBy || sortableColumns.length > 0) && (
        <div className="flex justify-end items-center"> {/* Use justify-between for sort and filter controls */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
            <select
              value={sortBy || ''}
              onChange={(e) => setSortBy(e.target.value === '' ? undefined : e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {sortableColumns
                .map((column, index) => (
                  <option key={index} value={column.header as string}>
                    {column.header}
                  </option>
                ))}
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      )}
      <div>
        <table className="w-full border-collapse divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-600">
              {visibleColumns.map((column, index) => (
                <th
                  key={index}
                  className={clsx(
                    'text-left p-3 font-semibold text-gray-900 dark:text-white',
                    column.headerClassName,
                    column.sortable && 'cursor-pointer', // Add cursor-pointer here
                  )}
                  onClick={() => handleSort(column)} // Add onClick back to th
                >
                  <div className="flex items-center justify-between"> {/* Use justify-between */}
                    <span className="flex-grow">{column.header}</span> {/* Wrap header in span and allow it to grow */}
                    {column.sortable && ( // Always render the span if sortable
                      <span className={clsx("text-xs ml-1 flex-shrink-0", {
                        "opacity-0": sortBy !== column.header // Make it invisible if not sorted by this column
                      })}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        <tbody className="">
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {visibleColumns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={clsx(
                    'px-3 py-2 text-sm text-gray-900 dark:text-white',
                    column.noWrap && 'whitespace-nowrap',
                    column.className,
                  )}
                >
                  {typeof column.accessor === 'function'
                    ? column.accessor(row)
                    : (row[column.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}
