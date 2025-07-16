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
  rowspan?: (data: T, index: number) => number | undefined;
  skipRender?: (data: T, index: number) => boolean; // Skip render function for rowspan cells
  dividerAfter?: boolean; // Vertical divider after this column
  dividerBefore?: boolean | ((data: T) => boolean); // Vertical divider before this column, can be conditional
  columnPadding?: string; // Horizontal padding only (px-0, px-1, px-2, etc.)
  cellStyle?: (
    data: T,
    rowIndex: number,
  ) =>
    | {
        className?: string;
        style?: React.CSSProperties;
        wrapper?: (content: React.ReactNode) => React.ReactNode;
      }
    | undefined; // New cell-specific styling function
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  maxColumns?: number; // Maximum number of columns to display
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
}

export default function DataTable<T>({
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

      const column = columns.find((col) => col.header === sortBy);

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
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted transition-colors duration-300">
              Sort by:
            </label>
            <select
              value={sortBy || ''}
              onChange={(e) => setSortBy(e.target.value === '' ? undefined : e.target.value)}
              className="px-3 py-1 border border-border rounded-md text-sm bg-surface text-primary transition-colors duration-300 focus:border-brand focus:outline-none"
            >
              <option value="">None</option>
              {sortableColumns.map((column, index) => (
                <option key={index} value={column.header as string}>
                  {column.header}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 bg-interactive-hover rounded text-sm hover:bg-interactive-active transition-colors duration-200"
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      )}
      <div>
        <table className="w-full border-collapse divide-y divide-border">
          <thead>
            <tr className="border-b-2 border-border">
              {visibleColumns.map((column, index) => (
                <th
                  key={index}
                  className={clsx(
                    'text-left py-3 font-semibold text-primary transition-colors duration-300',
                    column.columnPadding || 'px-3',
                    column.headerClassName,
                    column.sortable && 'cursor-pointer hover:text-brand',
                    column.dividerAfter && 'border-r-2 border-border',
                  )}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center justify-center">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span
                        className={clsx(
                          'text-xs ml-1 flex-shrink-0 transition-opacity duration-200',
                          {
                            'opacity-0': sortBy !== column.header,
                          },
                        )}
                      >
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
              <tr key={rowIndex} className="border-b border-border group">
                {visibleColumns.map((column, colIndex) => {
                  // Check if this cell should be skipped due to rowspan
                  if (column.skipRender?.(row, rowIndex)) {
                    return null;
                  }

                  // Get rowspan value if defined
                  const rowspanValue = column.rowspan?.(row, rowIndex);

                  // Check if divider should be shown before this column
                  const showDividerBefore =
                    typeof column.dividerBefore === 'function'
                      ? column.dividerBefore(row)
                      : column.dividerBefore;

                  // Get cell-specific styling
                  const cellStyling = column.cellStyle?.(row, rowIndex);

                  // Get cell content
                  const cellContent =
                    typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : (row[column.accessor] as React.ReactNode);

                  // Apply wrapper if provided
                  const finalContent = cellStyling?.wrapper
                    ? cellStyling.wrapper(cellContent)
                    : cellContent;

                  return (
                    <td
                      key={colIndex}
                      rowSpan={rowspanValue}
                      className={clsx(
                        'py-2 text-sm transition-colors duration-300',
                        column.columnPadding || 'px-3',
                        // Apply cell-specific classes first, then fallback to default colors
                        cellStyling?.className || 'text-primary',
                        column.noWrap && 'whitespace-nowrap',
                        column.className,
                        // Vertically center text for rowspan > 1, otherwise align top
                        (rowspanValue ?? 0) > 1 ? 'align-middle' : 'align-top',
                        column.dividerAfter && 'border-r-2 border-border',
                        showDividerBefore && 'border-l-2 border-border',
                        // Only apply hover effect if rowspan is 1 or undefined (single row)
                        (!rowspanValue || rowspanValue === 1) &&
                          'group-hover:bg-interactive-hover transition-colors duration-200',
                      )}
                      style={cellStyling?.style} // Add cell-specific inline styles
                    >
                      {finalContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
