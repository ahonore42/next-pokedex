import { useMemo } from 'react';
import { getDamageClassIcon, getDamageClassColor } from '~/utils';
import type { PokemonWithSpeciesOutput } from '~/server/routers/_app';
import DataTable, { Column } from '~/components/ui/tables';
import TypeBadge from '../pokemon-types/TypeBadge';

type PokemonMove = PokemonWithSpeciesOutput['moves'][number];

interface MoveTableProps {
  moves: PokemonMove[];
  learnMethod: string;
  learnMethodName?: string;
}

// Extended row type for 2-row layout
interface MoveTableRow {
  moveId: number;
  rowType: 'main' | 'description';
  move: PokemonMove['move'];
  moveLearnMethod: PokemonMove['moveLearnMethod'];
  levelLearnedAt?: number;
  versionGroup?: PokemonMove['versionGroup'];
}

export default function MoveTable({ moves, learnMethod, learnMethodName }: MoveTableProps) {
  // Filter moves by learn method
  const filteredMoves = useMemo(() => {
    return moves.filter((move) => move.moveLearnMethod.name === learnMethod);
  }, [moves, learnMethod]);

  // Transform moves into 2-row data structure
  const tableData = useMemo(() => {
    const rows: MoveTableRow[] = [];

    filteredMoves.forEach((pokemonMove) => {
      // Main row with move stats
      rows.push({
        moveId: pokemonMove.move.id,
        rowType: 'main',
        move: pokemonMove.move,
        moveLearnMethod: pokemonMove.moveLearnMethod,
        levelLearnedAt: pokemonMove.levelLearnedAt,
        versionGroup: pokemonMove.versionGroup,
      });

      // Description row
      rows.push({
        moveId: pokemonMove.move.id,
        rowType: 'description',
        move: pokemonMove.move,
        moveLearnMethod: pokemonMove.moveLearnMethod,
        levelLearnedAt: pokemonMove.levelLearnedAt,
        versionGroup: pokemonMove.versionGroup,
      });
    });

    return rows;
  }, [filteredMoves]);

  // Define columns for the new layout
  const moveTableColumns = useMemo(() => {
    // Helper function to create standard column structure
    const createColumn = (config: {
      header: string;
      accessor: (row: MoveTableRow) => React.ReactNode;
      sortKey?: (row: MoveTableRow) => any;
      className?: string;
      spans2Rows?: boolean;
      mainRowOnly?: boolean;
      colspan?: (row: MoveTableRow) => number | undefined;
      skipRender?: (row: MoveTableRow) => boolean;
    }): Column<MoveTableRow> => ({
      header: config.header,
      headerAlignment: 'left' as const,
      accessor: config.accessor,
      className: config.className || 'text-left',
      rowspan: config.spans2Rows
        ? (row: MoveTableRow) => (row.rowType === 'main' ? 2 : undefined)
        : undefined,
      // Skip render logic: spans2Rows OR mainRowOnly both skip description rows
      skipRender:
        config.spans2Rows || config.mainRowOnly
          ? (row: MoveTableRow) => row.rowType === 'description'
          : config.skipRender,
      colspan: config.colspan,
      sortable: !!config.sortKey,
      sortKey: config.sortKey,
    });

    const baseColumns: Column<MoveTableRow>[] = [
      // Move Name column (spans 2 rows)
      createColumn({
        header: 'Move',
        spans2Rows: true,
        accessor: (row) => {
          const moveName = row.move.names[0]?.name || row.move.name;
          return <div className="font-medium text-primary capitalize text-left">{moveName}</div>;
        },
        className: 'text-left align-middle',
        sortKey: (row) => row.move.name,
      }),

      // Type column
      createColumn({
        header: 'Type',
        mainRowOnly: true,
        accessor: (row) => <TypeBadge type={row.move.type.name} />,
        sortKey: (row) => row.move.type.name,
      }),

      // Category column
      createColumn({
        header: 'Category',
        mainRowOnly: true,
        accessor: (row) => {
          const damageClass = row.move.moveDamageClass?.name || 'status';
          return (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getDamageClassColor(damageClass)}`}
            >
              <span>{getDamageClassIcon(damageClass)}</span>
              <span className="hidden sm:inline capitalize">
                {row.move.moveDamageClass?.names[0]?.name || damageClass}
              </span>
            </span>
          );
        },
        sortKey: (row) => row.move.moveDamageClass?.name || 'status',
      }),

      // Power column
      createColumn({
        header: 'Power',
        mainRowOnly: true,
        accessor: (row) => <>{row.move.power || '—'}</>,
        className: 'font-medium text-primary text-left',
        sortKey: (row) => row.move.power || 0,
      }),

      // Priority column
      createColumn({
        header: 'Priority',
        mainRowOnly: true,
        accessor: (row) => {
          return row.move.priority !== 0 ? (
            <span className="text-xs text-muted text-left">
              {row.move.priority > 0 ? '+' : ''}
              {row.move.priority}
            </span>
          ) : (
            <span className="text-xs text-muted text-left">—</span>
          );
        },
        sortKey: (row) => row.move.priority || 0,
      }),

      // Effect Chance column
      createColumn({
        header: 'Effect Chance',
        mainRowOnly: true,
        accessor: (row) => <>{row.move.effectChance ? `${row.move.effectChance}%` : '—'}</>,
        className: 'font-medium text-primary text-left',
        sortKey: (row) => row.move.effectChance || 0,
      }),

      // PP column
      createColumn({
        header: 'PP',
        mainRowOnly: true,
        accessor: (row) => <>{row.move.pp}</>,
        className: 'font-medium text-primary text-left',
        sortKey: (row) => row.move.pp || 0,
      }),

      // Description column (spans remaining columns on description row)
      createColumn({
        header: '',
        accessor: (row) => {
          const description =
            row.move.effectEntries[0]?.shortEffect ||
            row.move.flavorTexts[0]?.flavorText ||
            'No description available';
          return <div className="text-sm text-muted text-left">{description}</div>;
        },
        colspan: (row) => (row.rowType === 'description' ? 6 : undefined),
        skipRender: (row) => row.rowType === 'main',
      }),
    ];

    // Add level column for level-up moves
    if (learnMethod === 'level-up') {
      return [
        createColumn({
          header: 'Level',
          spans2Rows: true,
          accessor: (row) => (
            <span className="font-medium text-primary text-left">
              {row.levelLearnedAt === 0 ? 'Evo' : row.levelLearnedAt}
            </span>
          ),
          className: 'font-medium text-primary text-left align-middle',
          sortKey: (row) => row.levelLearnedAt || 0,
        }),
        ...baseColumns,
      ];
    }

    return baseColumns;
  }, [learnMethod]);

  if (filteredMoves.length === 0) {
    return null;
  }

  return (
    <div className="card surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-xl font-bold text-primary mb-4 sm:mb-0 capitalize">
          {learnMethodName || learnMethod} Moves
          <span className="ml-2 text-sm font-normal text-muted">
            ({filteredMoves.length} moves)
          </span>
        </h3>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <DataTable
          data={tableData}
          columns={moveTableColumns}
          initialSortBy="Level"
          overlayHover={true}
          virtualScroll={{ enabled: false, rowHeight: 0 }}
        />
      </div>

      {/* Mobile Cards - keep existing mobile implementation */}
      <div className="lg:hidden space-y-4">
        {filteredMoves.map((pokemonMove: PokemonMove, index: number) => {
          const move = pokemonMove.move;
          const moveName = move.names[0]?.name || move.name;
          const damageClass = move.moveDamageClass?.name || 'status';
          const description =
            move.effectEntries[0]?.shortEffect ||
            move.flavorTexts[0]?.flavorText ||
            'No description available';

          return (
            <div key={`${move.id}-${index}`} className="border border-border rounded-lg p-4">
              {/* Move Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-primary capitalize">{moveName}</h4>
                  {learnMethod === 'level-up' && (
                    <p className="text-sm text-muted">
                      Level {pokemonMove.levelLearnedAt === 0 ? 'Evo' : pokemonMove.levelLearnedAt}
                    </p>
                  )}
                  {move.priority !== 0 && (
                    <p className="text-sm text-muted">
                      Priority: {move.priority > 0 ? '+' : ''}
                      {move.priority}
                    </p>
                  )}
                </div>
                <TypeBadge type={move.type.name} />
              </div>

              {/* Move Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <span className="text-muted">Category:</span>
                  <span
                    className={`ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getDamageClassColor(damageClass)}`}
                  >
                    <span>{getDamageClassIcon(damageClass)}</span>
                    <span className="capitalize">
                      {move.moveDamageClass?.names[0]?.name || damageClass}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-muted">Power:</span>
                  <span className="ml-1 font-medium text-primary">{move.power || '—'}</span>
                </div>
                <div>
                  <span className="text-muted">PP:</span>
                  <span className="ml-1 font-medium text-primary">{move.pp}</span>
                </div>
                <div>
                  <span className="text-muted">Effect Chance:</span>
                  <span className="ml-1 font-medium text-primary">
                    {move.effectChance ? `${move.effectChance}%` : '—'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="text-sm text-muted border-t border-border pt-2">{description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
