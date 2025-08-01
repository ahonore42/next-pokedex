import { useRouter } from 'next/router';
import Link from 'next/link';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { TypePokemonData, TypeMoveData } from '~/server/routers/_app';
import TypeBadge from '~/components/pokemon-types/TypeBadge';
import DataTable, { Column } from '~/components/ui/tables';
import MoveTypeBadge from '~/components/ui/MoveTypeBadge';
import TabView from '~/components/ui/TabView';
import PageHeading from '~/components/layout/PageHeading';
import { capitalizeName } from '~/utils/text';
import PageContent from '~/components/layout/PageContent';
import { getRgba, getTypeColor } from '~/utils/pokemon';
import Sprite from '~/components/ui/Sprite';
import TypesDisplay from '~/components/pokemon-types/TypesDisplay';
import TypeBadgesDisplay from '~/components/pokemon-types/TypeBadgesDisplay';

interface MoveTableRow {
  moveId: number;
  rowType: 'main' | 'description';
  move: TypeMoveData;
}

const PokemonTypeDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { typeName } = router.query;

  const { data, isLoading, error } = trpc.types.getTypeWithPokemonAndMoves.useQuery(
    { typeName: typeName as string },
    {
      enabled: !!typeName && typeof typeName === 'string',
    },
  );

  console.log({ isLoading, error, data });
  const isPageLoading = isLoading || !data?.type || !data?.pokemon?.length || !data?.moves?.length;
  if (isPageLoading) {
    return null; // Let DefaultLayout handle the loading display
  }
  const { type, types, pokemon, moves } = data;

  const pokemonColumns: Column<TypePokemonData>[] = [
    {
      header: 'No.',
      accessor: (row) => `#${row.pokemonSpeciesId}`,
      className: 'text-center',
      sortable: true,
      sortKey: (row) => row.pokemonSpeciesId,
    },
    {
      header: 'Pokémon',
      accessor: (row) => (
        <Link href={`/pokemon/${row.id}`} className="flex items-center gap-2 hover:underline">
          <Sprite
            src={row.sprites?.frontDefault || row.sprites?.frontShiny || ''}
            alt={row.name}
            variant="xs"
          />
          <span className="capitalize font-medium">{row.name.replaceAll('-', ' ')}</span>
        </Link>
      ),
      sortable: true,
      sortKey: (row) => row.name,
    },
    {
      header: 'Types',
      accessor: (row) => (
        <div className="flex justify-center items-center">
          <TypeBadgesDisplay types={row.types.map((type) => type.type.name)} />
        </div>
      ),
    },
    {
      header: 'Abilities',
      accessor: (row) => (
        <div className="flex flex-col gap-0.5">
          {row.abilities.map((t) => (
            <Link
              key={t.ability.name}
              href={`/abilities/${t.ability.name}`}
              className="flex items-center hover:underline"
            >
              {t.ability.names[0]?.name || t.ability.name}
            </Link>
          ))}
        </div>
      ),
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
      sortKey: (row) =>
        row.stats.find((stat) => stat.stat.name === 'special-attack')?.baseStat || 0,
    },
    {
      header: 'Sp. Def',
      accessor: (row) =>
        row.stats.find((stat) => stat.stat.name === 'special-defense')?.baseStat || '—',
      className: 'text-center',
      sortable: true,
      sortKey: (row) =>
        row.stats.find((stat) => stat.stat.name === 'special-defense')?.baseStat || 0,
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

  // Transform moves into 2-row data structure
  const createMoveRows = (moves: TypeMoveData[]) => {
    const rows: MoveTableRow[] = [];

    moves.forEach((move) => {
      // Main row with move stats
      rows.push({
        moveId: move.id,
        rowType: 'main',
        move: move,
      });

      // Description row
      rows.push({
        moveId: move.id,
        rowType: 'description',
        move: move,
      });
    });

    return rows;
  };

  // Helper function to create standard column structure
  const createColumn = (config: {
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

  const moveColumns: Column<MoveTableRow>[] = [
    // Move Name column (spans 2 rows)
    createColumn({
      header: 'Move',
      spans2Rows: true,
      accessor: (row) => row.move.names[0]?.name || row.move.name,
      className: 'font-medium text-center capitalize',

      sortKey: (row) => row.move.name,
      dividerAfter: true,
    }),

    // TM column (also handles description on second row)
    createColumn({
      header: 'TM',
      accessor: (row) => {
        // Description row - show description content
        if (row.rowType === 'description') {
          return (
            row.move.flavorTexts[0]?.flavorText ||
            row.move.effectEntries[0]?.shortEffect ||
            'No description available'
          );
        }

        // Main row - show TM data
        const latestTm = row.move.machines
          ?.filter(
            (machine) => machine.item.name.startsWith('tm') || machine.item.name.startsWith('hm'),
          )
          .sort((a, b) => (b.versionGroup?.order || 0) - (a.versionGroup?.order || 0))
          .map((machine) => machine.item.name.toUpperCase())[0];
        return latestTm || '—';
      },

      sortKey: (row) => {
        const latestTm = row.move.machines
          ?.filter(
            (machine) => machine.item.name.startsWith('tm') || machine.item.name.startsWith('hm'),
          )
          .sort((a, b) => (b.versionGroup?.order || 0) - (a.versionGroup?.order || 0))
          .map((machine) => machine.item.name.toUpperCase())[0];
        const tmNumber = latestTm ? parseInt(latestTm.replace(/[^0-9]/g, ''), 10) : 0;
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
    createColumn({
      header: 'Type',
      mainRowOnly: true,
      accessor: (row) => <TypeBadge type={row.move.type.name} link={false} />,
      sortKey: (row) => row.move.type.name,
      dividerAfter: true,
    }),

    // Category column
    createColumn({
      header: 'Category',
      mainRowOnly: true,
      accessor: (row) => <MoveTypeBadge moveDamageClass={row.move.moveDamageClass} />,
      sortKey: (row) => row.move.moveDamageClass.name,
      dividerAfter: true,
    }),

    // Power column
    createColumn({
      header: 'Power',
      mainRowOnly: true,
      accessor: (row) => <>{row.move.power || '—'}</>,
      sortKey: (row) => row.move.power || 0,
      dividerAfter: true,
      headerAlignment: 'center',
    }),

    // Accuracy column
    createColumn({
      header: 'Accuracy',
      mainRowOnly: true,
      accessor: (row) => <>{row.move.accuracy ? `${row.move.accuracy}%` : '—'}</>,
      sortKey: (row) => row.move.accuracy || 0,
      dividerAfter: true,
      headerAlignment: 'center',
    }),

    // PP column
    createColumn({
      header: 'PP',
      mainRowOnly: true,
      accessor: (row) => <>{row.move.pp || '—'}</>,
      sortKey: (row) => row.move.pp || 0,
      dividerAfter: true,
      headerAlignment: 'center',
    }),

    // Priority column
    createColumn({
      header: 'Priority',
      mainRowOnly: true,
      accessor: (row) => <>{row.move.priority}</>,
      sortKey: (row) => row.move.priority,
      dividerAfter: true,
      headerAlignment: 'center',
    }),

    // Effect% column
    createColumn({
      header: 'Effect%',
      mainRowOnly: true,
      accessor: (row) => <>{row.move.effectChance ? `${row.move.effectChance}%` : '—'}</>,
      sortKey: (row) => row.move.effectChance || 0,
      dividerAfter: false,
      headerAlignment: 'center',
    }),
  ];

  const moveRows = createMoveRows(moves || []);
  const hexColor = getTypeColor(type.name);
  const bgOverlay = getRgba(hexColor, 0.1);
  const formattedName = capitalizeName(type.name);
  return (
    <>
      <PageHeading
        pageTitle={`${formattedName} Type - Pokémon and Moves`}
        subtitle={`Pokémon and Moves`}
        metaDescription={`${formattedName} type Pokémon and moves`}
        schemaType="WebPage"
        breadcrumbLinks={[
          { label: 'Home', href: '/' },
          { label: 'Pokémon Types', href: '/pokemon-types' },
        ]}
        currentPage={`${formattedName}`}
        title={`${formattedName} Type`}
      />

      <PageContent>
        <TypesDisplay types={types} />
        <div className="rounded-lg">
          <TabView
            tabs={[
              {
                label: 'Pokémon',
                content: (
                  <div
                    className="shadow-lg rounded-lg overflow-hidden"
                    style={{ backgroundColor: bgOverlay }}
                  >
                    <DataTable data={pokemon} columns={pokemonColumns} border rounded />
                  </div>
                ),
                badge: pokemon.length,
              },
              {
                label: 'Moves',
                content: (
                  <div
                    className="shadow-lg rounded-lg overflow-hidden"
                    style={{ backgroundColor: bgOverlay }}
                  >
                    <DataTable data={moveRows} columns={moveColumns} border rounded />
                  </div>
                ),
                badge: moves.length,
              },
            ]}
            initialTab="Pokémon"
          />
        </div>
      </PageContent>
    </>
  );
};

export default PokemonTypeDetailPage;
