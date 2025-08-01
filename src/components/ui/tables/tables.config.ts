import { renderTypeBadgesDisplay } from '~/components/pokemon-types/TypeBadgesDisplay';
import { renderTableLink } from './TableLink';
import { renderTableLinks } from './TableLinks';

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

type TableSprites = {
  frontDefault?: string | null;
  frontShiny?: string | null;
};

type TableAbility = {
  ability: {
    id: number;
    name: string;
    names: {
      name: string;
    }[];
  };
  slot: number;
  isHidden: boolean;
};

type TableStat = {
  stat: {
    id: number;
    name: string;
  };
  baseStat: number;
};

export type PokemonColumns = {
  pokemonId: number;
  speciesId: number;
  name: string;
  sprites: TableSprites;
  types: string[];
  abilities: TableAbility[];
  stats: TableStat[];
};

// Reusable configuration for Pokémon table displays
export const pokemonColumns: Column<PokemonColumns>[] = [
  {
    header: 'No.',
    accessor: (row) => `#${row.speciesId}`,
    className: 'text-center',
    sortable: true,
    sortKey: (row) => row.speciesId,
  },
  {
    header: 'Pokémon',
    headerAlignment: 'left',
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
      const abilityLinks = row.abilities.map(({ ability }: TableAbility) => ({
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
    header: 'Attack',
    accessor: (row) => row.stats.find((stat) => stat.stat.name === 'attack')?.baseStat || '—',
    className: 'text-center',
    sortable: true,
    sortKey: (row) => row.stats.find((stat) => stat.stat.name === 'attack')?.baseStat || 0,
  },
  {
    header: 'Defense',
    accessor: (row) => row.stats.find((stat) => stat.stat.name === 'defense')?.baseStat || '—',
    className: 'text-center',
    sortable: true,
    sortKey: (row) => row.stats.find((stat) => stat.stat.name === 'defense')?.baseStat || 0,
  },
  {
    header: 'Sp. Atk',
    accessor: (row) =>
      row.stats.find((stat) => stat.stat.name === 'special-attack')?.baseStat || '—',
    className: 'text-center',
    sortable: true,
    sortKey: (row) => row.stats.find((stat) => stat.stat.name === 'special-attack')?.baseStat || 0,
  },
  {
    header: 'Sp. Def',
    accessor: (row) =>
      row.stats.find((stat) => stat.stat.name === 'special-defense')?.baseStat || '—',
    className: 'text-center',
    sortable: true,
    sortKey: (row) => row.stats.find((stat) => stat.stat.name === 'special-defense')?.baseStat || 0,
  },
  {
    header: 'Speed',
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
