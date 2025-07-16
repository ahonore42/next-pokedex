import { useMemo } from 'react';
import { getTypeColor, getDamageClassIcon, getDamageClassColor } from '~/utils/pokemon';
import type { PokemonDetailedById } from '~/server/routers/_app';
import DataTable, { Column } from '~/components/ui/DataTable';
import TypeBadge from '../pokemon-types/TypeBadge';

type PokemonMove = PokemonDetailedById['moves'][number];

interface MoveTableProps {
  moves: PokemonMove[];
  learnMethod: string;
  learnMethodName?: string;
}

export default function MoveTable({ moves, learnMethod, learnMethodName }: MoveTableProps) {
  // Filter moves by learn method
  const filteredMoves = useMemo(() => {
    return moves.filter((move) => move.moveLearnMethod.name === learnMethod);
  }, [moves, learnMethod]);

  const moveTableColumns = useMemo(() => {
    const baseColumns: Column<PokemonMove>[] = [
      {
        header: 'Move',
        accessor: (row: PokemonMove) => {
          const moveName = row.move.names[0]?.name || row.move.name;
          return (
            <>
              <div className="font-medium text-primary capitalize">{moveName}</div>
              {row.move.priority !== 0 && (
                <div className="text-xs text-muted">
                  Priority: {row.move.priority > 0 ? '+' : ''}
                  {row.move.priority}
                </div>
              )}
            </>
          );
        },
        sortable: true,
        sortKey: (row: PokemonMove) => row.move.name,
      },
      {
        header: 'Type',
        accessor: (row: PokemonMove) => <TypeBadge type={row.move.type} />,
        sortable: true,
        sortKey: (row: PokemonMove) => row.move.type.name,
      },
      {
        header: 'Category',
        accessor: (row: PokemonMove) => {
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
        sortable: true,
        sortKey: (row: PokemonMove) => row.move.moveDamageClass?.name || 'status',
      },
      {
        header: 'Power',
        accessor: (row: PokemonMove) => <>{row.move.power || '—'}</>,
        className: 'font-medium text-primary',
        sortable: true,
        sortKey: (row: PokemonMove) => row.move.power || 0,
      },
      {
        header: 'Accuracy',
        accessor: (row: PokemonMove) => <>{row.move.accuracy ? `${row.move.accuracy}%` : '—'}</>,
        className: 'font-medium text-primary',
        sortable: true,
        sortKey: (row: PokemonMove) => row.move.accuracy || 0,
      },
      {
        header: 'Effect Chance',
        accessor: (row: PokemonMove) => (
          <>{row.move.effectChance ? `${row.move.effectChance}%` : '—'}</>
        ),
        className: 'font-medium text-primary',
        sortable: true,
        sortKey: (row: PokemonMove) => row.move.effectChance || 0,
      },
      {
        header: 'PP',
        accessor: (row: PokemonMove) => <>{row.move.pp}</>,
        className: 'font-medium text-primary',
        sortable: true,
        sortKey: (row: PokemonMove) => row.move.pp || 0,
      },
      {
        header: 'Description',
        accessor: (row: PokemonMove) => {
          const description =
            row.move.effectEntries[0]?.shortEffect ||
            row.move.flavorTexts[0]?.flavorText ||
            'No description available';
          return <div className="line-clamp-2">{description}</div>;
        },
        className: 'text-sm text-muted max-w-xs',
        sortable: false,
      },
    ];

    if (learnMethod === 'level-up') {
      return [
        {
          header: 'Level',
          accessor: (row: PokemonMove) => (
            <span className="font-medium text-primary">
              {row.levelLearnedAt === 0 ? 'Evo' : row.levelLearnedAt}
            </span>
          ),
          className: 'font-medium text-primary',
          sortable: true,
          sortKey: (row: PokemonMove) => row.levelLearnedAt,
        },
        ...baseColumns,
      ];
    }
    return baseColumns;
  }, [learnMethod]);

  if (filteredMoves.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface-elevated rounded-lg shadow-lg p-6 mb-6">
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
          data={filteredMoves}
          columns={moveTableColumns}
          initialSortBy="Level"
          overlayHover={true}
        />
      </div>

      {/* Mobile Cards */}
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
                      Level{' '}
                      {pokemonMove.levelLearnedAt === 0 ? 'Evolution' : pokemonMove.levelLearnedAt}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-1 rounded text-white text-xs font-medium"
                    style={{ backgroundColor: getTypeColor(move.type.name) }}
                  >
                    {move.type.name.toUpperCase()}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getDamageClassColor(damageClass)}`}
                  >
                    {getDamageClassIcon(damageClass)}
                  </span>
                </div>
              </div>

              {/* Move Stats */}
              <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                <div>
                  <span className="text-muted">Power:</span>
                  <span className="ml-1 font-medium text-primary">{move.power || '—'}</span>
                </div>
                <div>
                  <span className="text-muted">Accuracy:</span>
                  <span className="ml-1 font-medium text-primary">
                    {move.accuracy ? `${move.accuracy}%` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted">Effect Chance:</span>
                  <span className="ml-1 font-medium text-primary">
                    {move.effectChance ? `${move.effectChance}%` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted">PP:</span>
                  <span className="ml-1 font-medium text-primary">{move.pp}</span>
                </div>
              </div>

              {/* Move Description */}
              <p className="text-sm text-muted">{description}</p>

              {/* Priority */}
              {move.priority !== 0 && (
                <p className="text-xs text-muted mt-2">
                  Priority: {move.priority > 0 ? '+' : ''}
                  {move.priority}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMoves.length === 0 && (
        <div className="text-center py-8 text-muted">
          <p>No moves found for the selected criteria.</p>
        </div>
      )}
    </div>
  );
}
