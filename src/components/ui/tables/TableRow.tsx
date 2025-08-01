import React from 'react';
import clsx from 'clsx';
import { Column } from './tables.config';

interface TableRowProps<T> {
  row: T;
  rowIndex: number;
  visibleColumns: Column<T>[];
  sortedDataLength: number;
  overlayHover?: boolean;
  noPadding?: boolean;
  square?: string;
}

export default function TableRow<T>({
  row,
  rowIndex,
  visibleColumns,
  sortedDataLength,
  overlayHover = false,
  noPadding = false,
  square,
}: TableRowProps<T>) {
  return (
    <tr
      className={clsx(
        !square && 'theme-transition',
        // Add bottom border for square tables except on last row
        rowIndex < sortedDataLength - 1 && 'border-b border-border',
        overlayHover && 'group',
      )}
    >
      {visibleColumns.map((column, colIndex) => {
        if (column.skipRender?.(row, rowIndex)) {
          return null;
        }

        const rowspanValue = column.rowspan?.(row, rowIndex);
        const colspanValue = column.colspan?.(row, rowIndex);
        const showDividerBefore =
          typeof column.dividerBefore === 'function'
            ? column.dividerBefore(row)
            : column.dividerBefore;

        const showDividerAfter =
          typeof column.dividerAfter === 'function'
            ? column.dividerAfter(row)
            : column.dividerAfter;

        const cellStyling = column.cellStyle?.(row, rowIndex);

        const cellContent =
          typeof column.accessor === 'function'
            ? column.accessor(row)
            : (row[column.accessor] as React.ReactNode);

        const finalContent = cellStyling?.wrapper ? cellStyling.wrapper(cellContent) : cellContent;

        // Data cell - individual cell content
        return (
          <td
            key={colIndex}
            rowSpan={rowspanValue}
            colSpan={colspanValue}
            className={clsx(
              'text-sm theme-transition align-middle',
              // Handle padding based on noPadding prop
              noPadding ? 'p-0' : 'py-2',
              noPadding ? '' : column.columnPadding || 'px-3',
              cellStyling?.className || 'text-primary',
              column.noWrap && 'whitespace-nowrap',
              column.className || 'font-medium text-center', // Column className can override text alignment
              // Column dividers for square tables - between cells but not on edges
              square && colIndex < visibleColumns.length - 1 && 'border-r border-border',
              // Regular dividers for non-square tables
              !square && showDividerAfter && 'border-r-2 border-border',
              !square && showDividerBefore && 'border-l-2 border-border',
              // Darken the row on hover with subtle brightness reduction
              overlayHover && (!rowspanValue || rowspanValue === 1) && 'group-hover:brightness-90',
            )}
            style={cellStyling?.style}
          >
            {finalContent}
          </td>
        );
      })}
    </tr>
  );
}
