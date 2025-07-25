import React from 'react';
import clsx from 'clsx';
import TableColumn, { Column } from './TableColumn';
import TableRow from './TableRow';

interface SquareTableProps<T> {
  sortedData: T[];
  visibleColumns: Column<T>[];
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: Column<T>) => void;
  overlayHover?: boolean;
  noPadding?: boolean;
  square?: string;
}

export default function SquareTable<T>({
  sortedData,
  visibleColumns,
  sortBy,
  onSort,
  overlayHover = false,
  noPadding = false,
  square,
}: SquareTableProps<T>) {
  return (
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
              <TableColumn
                key={index}
                column={column}
                index={index}
                visibleColumnsLength={visibleColumns.length}
                sortBy={sortBy}
                onSort={onSort}
                noPadding={noPadding}
                square={square}
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
              square={square}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
