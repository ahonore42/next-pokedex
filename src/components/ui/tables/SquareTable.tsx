import { Column } from './tables.config';
import TableColumn from './TableColumn';
import TableRow from './TableRow';

interface SquareTableProps<T> {
  data: T[];
  columns: Column<T>[];
  overlayHover?: boolean;
  noPadding?: boolean;
  rounded?: boolean;
  className?: string;
}

export default function SquareTable<T>({
  data,
  columns,
  overlayHover = false,
  noPadding = false,
  rounded = false,
  className,
}: SquareTableProps<T>) {
  return (
    <div
      className={`${rounded && 'rounded-lg overflow-hidden'} 
      flex flex-col w-fit border border-border ${className}`}
    >
      <table className="border-collapse divide-y divide-border">
        {/* TABLE HEADER - Column definitions */}
        <thead>
          <tr className="theme-transition">
            {columns.map((column, index) => (
              <TableColumn
                key={index}
                column={column}
                index={index}
                visibleColumnsLength={columns.length}
                noPadding={noPadding}
                square="square"
              />
            ))}
          </tr>
        </thead>

        {/* TABLE BODY - Data rows */}
        <tbody className="">
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              row={row}
              rowIndex={rowIndex}
              visibleColumns={columns}
              sortedDataLength={data.length}
              overlayHover={overlayHover}
              noPadding={noPadding}
              square="square"
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
