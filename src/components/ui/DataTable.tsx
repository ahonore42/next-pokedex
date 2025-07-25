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
  overlayHover?: boolean; // Use overlay hover effects
  noPadding?: boolean; // Remove padding from header columns and first column cells
  square?: string; // Tailwind width class for square/grid tables (e.g., 'w-[930px]', 'w-full', 'w-96')
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
    <div className={clsx('flex flex-col', square ? 'w-fit' : 'gap-4 w-full overflow-scroll')}>
      {(initialSortBy || sortableColumns.length > 0) && (
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted theme-transition">Sort by:</label>
            <select
              value={sortBy || ''}
              onChange={(e) => setSortBy(e.target.value === '' ? undefined : e.target.value)}
              className="px-3 py-1 border border-border rounded-md text-sm bg-surface text-primary theme-transition focus:border-brand focus:outline-none"
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
              className="px-2 py-1 bg-interactive-hover rounded text-sm hover:bg-interactive-active interactive-transition"
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      )}
      <div>
        <table
          className={clsx(
            'border-collapse',
            square ? '' : 'divide-y divide-border',
            square || 'w-full',
          )}
        >
          {/* TABLE HEADER - Column definitions */}
          <thead>
            <tr className={clsx(!square && 'border-b-2 border-border theme-transition')}>
              {visibleColumns.map((column, index) => (
                <th
                  key={index}
                  className={clsx(
                    'text-left font-semibold text-primary theme-transition',
                    noPadding ? 'p-0' : 'py-3',
                    noPadding ? '' : column.columnPadding || 'px-3',
                    column.headerClassName,
                    column.sortable && 'cursor-pointer hover:text-brand',
                    // Column dividers for square tables - between headers but not on edges
                    square && index < visibleColumns.length - 1 && 'border-r border-border',
                    // Regular dividers for non-square tables
                    !square && column.dividerAfter && 'border-r-2 border-border',
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
          {/* TABLE BODY - Data rows */}
          <tbody className="">
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={clsx(
                  !square && 'border-b border-border theme-transition',
                  // Add bottom border for square tables except on last row
                  square && rowIndex < sortedData.length - 1 && 'border-b border-border',
                  overlayHover && 'group',
                )}
              >
                {visibleColumns.map((column, colIndex) => {
                  if (column.skipRender?.(row, rowIndex)) {
                    return null;
                  }

                  const rowspanValue = column.rowspan?.(row, rowIndex);
                  const showDividerBefore =
                    typeof column.dividerBefore === 'function'
                      ? column.dividerBefore(row)
                      : column.dividerBefore;
                  const cellStyling = column.cellStyle?.(row, rowIndex);

                  const cellContent =
                    typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : (row[column.accessor] as React.ReactNode);

                  const finalContent = cellStyling?.wrapper
                    ? cellStyling.wrapper(cellContent)
                    : cellContent;

                  // Data cell - individual cell content
                  return (
                    <td
                      key={colIndex}
                      rowSpan={rowspanValue}
                      className={clsx(
                        'text-sm theme-transition',
                        // Handle padding based on noPadding prop
                        noPadding ? 'p-0' : 'py-2',
                        noPadding ? '' : column.columnPadding || 'px-3',
                        // Center content for data cells when noPadding is true OR when padding is included
                        noPadding && colIndex > 0
                          ? 'text-center align-middle'
                          : 'text-center align-middle',
                        cellStyling?.className || 'text-primary',
                        column.noWrap && 'whitespace-nowrap',
                        column.className,
                        (rowspanValue ?? 0) > 1 ? 'align-middle' : 'align-top',
                        // Column dividers for square tables - between cells but not on edges
                        square &&
                          colIndex < visibleColumns.length - 1 &&
                          'border-r border-border',
                        // Regular dividers for non-square tables
                        !square && column.dividerAfter && 'border-r-2 border-border',
                        !square && showDividerBefore && 'border-l-2 border-border',
                        // Darken the row on hover with subtle brightness reduction
                        overlayHover &&
                          (!rowspanValue || rowspanValue === 1) &&
                          'group-hover:brightness-90',
                      )}
                      style={cellStyling?.style}
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
