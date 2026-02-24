import DataTable from './DataTable';
export { default as SquareTable } from './SquareTable';
export { default as TableColumn } from './TableColumn';
export { default as TableRow } from './TableRow';

// Types
export type { Column, MoveColumns, MoveTableRow, AbilityColumns, AbilityTableRow, ItemColumns, ItemTableRow } from './tables.config';

// Config
export { pokemonColumns, moveColumns, abilityColumns, itemColumns } from './tables.config';

export default DataTable;
