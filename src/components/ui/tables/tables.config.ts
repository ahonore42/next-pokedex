import { renderTypeBadgesDisplay } from '~/components/pokemon-types/TypeBadgesDisplay';
import { renderTableLink } from './TableLink';
import { renderTableLinks } from './TableLinks';
import { renderTypeBadge } from '~/components/pokemon-types/TypeBadge';
import { renderMoveTypeBadge } from '../MoveTypeBadge';
import { PokemonListAbility, PokemonListData } from '~/lib/types';

// Types and interfaces
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
  dividerAfter?: boolean | ((data: T) => boolean);
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

// Reusable configuration for Pokémon table displays
export const pokemonColumns: Column<PokemonListData>[] = [
  {
    header: 'No.',
    accessor: (row) => `#${row.speciesId.toString().padStart(3, '0')}`,
    className: 'text-center',
    sortable: true,
    sortKey: (row) => row.speciesId,
  },
  {
    header: 'Pokémon',
    headerAlignment: 'left',
    className: 'max-w-40',
    accessor: (row) =>
      renderTableLink({
        href: `/pokemon/${row.pokemonId}`,
        src: row.sprites?.frontDefault || row.sprites?.frontShiny || '',
        label: row.name,
      }),
    sortable: true,
    sortKey: (row) => row.name,
  },
  {
    header: 'Types',
    accessor: (row) => renderTypeBadgesDisplay({ types: row.types }),
  },
  {
    header: 'Abilities',
    accessor: (row) => {
      const abilityLinks = row.abilities.map(({ ability }: PokemonListAbility) => ({
        href: `/abilities/${ability.name}`,
        label: ability.names[0]?.name || ability.name,
        containerStyle: 'flex flex-col gap-0.5',
      }));
      return renderTableLinks({ links: abilityLinks });
    },
  },
  {
    header: 'HP',
    accessor: (row) => row.stats.find((stat) => stat.stat.name === 'hp')?.baseStat || '—',
    className: 'text-center',
    sortable: true,
    sortKey: (row) => row.stats.find((stat) => stat.stat.name === 'hp')?.baseStat || 0,
  },
  {
    header: 'Atk',
    accessor: (row) => row.stats.find((stat) => stat.stat.name === 'attack')?.baseStat || '—',
    className: 'text-center',
    sortable: true,
    sortKey: (row) => row.stats.find((stat) => stat.stat.name === 'attack')?.baseStat || 0,
  },
  {
    header: 'Def',
    accessor: (row) => row.stats.find((stat) => stat.stat.name === 'defense')?.baseStat || '—',
    className: 'text-center',
    sortable: true,
    sortKey: (row) => row.stats.find((stat) => stat.stat.name === 'defense')?.baseStat || 0,
  },
  {
    header: 'Sp. Atk',
    headerClassName: 'whitespace-nowrap',
    accessor: (row) =>
      row.stats.find((stat) => stat.stat.name === 'special-attack')?.baseStat || '—',
    className: 'text-center',
    sortable: true,
    sortKey: (row) => row.stats.find((stat) => stat.stat.name === 'special-attack')?.baseStat || 0,
  },
  {
    header: 'Sp. Def',
    headerClassName: 'whitespace-nowrap',
    accessor: (row) =>
      row.stats.find((stat) => stat.stat.name === 'special-defense')?.baseStat || '—',
    className: 'text-center',
    sortable: true,
    sortKey: (row) => row.stats.find((stat) => stat.stat.name === 'special-defense')?.baseStat || 0,
  },
  {
    header: 'Spd',
    accessor: (row) => row.stats.find((stat) => stat.stat.name === 'speed')?.baseStat || '—',
    className: 'text-center',
    sortable: true,
    sortKey: (row) => row.stats.find((stat) => stat.stat.name === 'speed')?.baseStat || 0,
  },
  {
    header: 'Total',
    accessor: (row) => row.stats.reduce((sum, stat) => sum + stat.baseStat, 0),
    className: 'font-bold text-center',
    sortable: true,
    sortKey: (row) => row.stats.reduce((sum, stat) => sum + stat.baseStat, 0),
  },
];

export type MoveColumns = {
  name: string;
  type: string;
  damageClass: string;
  description: string;
  machine: string | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  effectChance: number | null;
};

export type MoveTableRow = {
  moveId: number;
  rowType: 'main' | 'description';
  move: MoveColumns;
};

// Helper function to create standard column structure
const createMoveColumn = (config: {
  header: string;
  accessor: (row: MoveTableRow) => React.ReactNode;
  sortKey?: (row: MoveTableRow) => number | string;
  className?: string;
  headerAlignment?: 'left' | 'center' | 'right';
  spans2Rows?: boolean;
  mainRowOnly?: boolean;
  colspan?: (row: MoveTableRow) => number | undefined;
  skipRender?: (row: MoveTableRow) => boolean;
  dividerAfter?: boolean | ((row: MoveTableRow) => boolean);
  cellStyle?: (
    row: MoveTableRow,
    rowIndex: number,
  ) => {
    className?: string;
    style?: React.CSSProperties;
    wrapper?: (content: React.ReactNode) => React.ReactNode;
  };
}): Column<MoveTableRow> => ({
  header: config.header,
  accessor: config.accessor,
  className: config.className,
  headerAlignment: config.headerAlignment,
  rowspan: config.spans2Rows
    ? (row: MoveTableRow) => (row.rowType === 'main' ? 2 : undefined)
    : undefined,
  skipRender:
    config.spans2Rows || config.mainRowOnly
      ? (row: MoveTableRow) => row.rowType === 'description'
      : config.skipRender,
  colspan: config.colspan,
  sortable: !!config.sortKey,
  sortKey: config.sortKey,
  dividerAfter: config.dividerAfter,
  cellStyle: config.cellStyle,
});

export const moveColumns: Column<MoveTableRow>[] = [
  // Move Name column (spans 2 rows)
  createMoveColumn({
    header: 'Move',
    spans2Rows: true,
    accessor: (row) => row.move.name,
    className: 'font-medium text-center capitalize',
    sortKey: (row) => row.move.name,
    dividerAfter: true,
  }),

  // TM column (also handles description on second row)
  createMoveColumn({
    header: 'TM',
    accessor: (row) => {
      // Description row - show description content
      if (row.rowType === 'description') {
        return row.move.description;
      }

      // Main row - show TM data
      return row.move.machine || '—';
    },

    sortKey: (row) => {
      const tmNumber = row.move.machine ? parseInt(row.move.machine.replace(/[^0-9]/g, ''), 10) : 0;
      return tmNumber;
    },
    dividerAfter: (row) => row.rowType === 'main',
    colspan: (row) => (row.rowType === 'description' ? 8 : undefined),
    cellStyle: (row) => ({
      className:
        row.rowType === 'description' ? 'text-left font medium' : 'text-center font-medium',
    }),
  }),

  // Type column
  createMoveColumn({
    header: 'Type',
    mainRowOnly: true,
    accessor: (row) => renderTypeBadge({ type: row.move.type, link: false }),
    sortKey: (row) => row.move.type,
    dividerAfter: true,
  }),

  // Category column
  createMoveColumn({
    header: 'Cat.',
    mainRowOnly: true,
    accessor: (row) => renderMoveTypeBadge({ damageClass: row.move.damageClass }),
    sortKey: (row) => row.move.damageClass,
    dividerAfter: true,
  }),

  // Power column
  createMoveColumn({
    header: 'Att.',
    mainRowOnly: true,
    accessor: (row) => row.move.power || '—',
    sortKey: (row) => row.move.power || 0,
    dividerAfter: true,
    headerAlignment: 'center',
  }),

  // Accuracy column
  createMoveColumn({
    header: 'Acc.',
    mainRowOnly: true,
    accessor: (row) => (row.move.accuracy ? `${row.move.accuracy}%` : '—'),
    sortKey: (row) => row.move.accuracy || 0,
    dividerAfter: true,
    headerAlignment: 'center',
  }),

  // Effect% column
  createMoveColumn({
    header: 'Eff. %',
    mainRowOnly: true,
    accessor: (row) => (row.move.effectChance ? `${row.move.effectChance}%` : '—'),
    sortKey: (row) => row.move.effectChance || 0,
    dividerAfter: true,
    headerAlignment: 'center',
  }),

  // PP column
  createMoveColumn({
    header: 'PP',
    mainRowOnly: true,
    accessor: (row) => row.move.pp || '—',
    sortKey: (row) => row.move.pp || 0,
    dividerAfter: true,
    headerAlignment: 'center',
  }),

  // Priority column
  createMoveColumn({
    header: 'Priority',
    mainRowOnly: true,
    accessor: (row) => row.move.priority,
    sortKey: (row) => row.move.priority,
    dividerAfter: false,
    headerAlignment: 'center',
  }),
];
