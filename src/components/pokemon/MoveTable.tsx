import { useState, useMemo } from 'react';
import { getTypeColor, getDamageClassIcon, getDamageClassColor } from '~/utils/pokemon';
import { capitalizeName } from '~/utils/text';
import { DataTable, Column } from '~/components/ui/DataTable';
import type { RouterOutputs } from '~/server/routers/_app';

type PokemonDetailData = RouterOutputs['pokemon']['detailedById'];
type PokemonMove = PokemonDetailData['moves'][0];

interface MoveTableProps {
  moves: PokemonMove[];
  learnMethod: string;
  learnMethodName?: string;
}

const MoveTable: React.FC<MoveTableProps> = ({ moves, learnMethod, learnMethodName }) => {
  const [selectedGeneration, setSelectedGeneration] = useState<number | 'all'>('all');

  // Filter moves by learn method
  const filteredMoves = useMemo(() => {
    return moves.filter((move) => move.moveLearnMethod.name === learnMethod);
  }, [moves, learnMethod]);

  // Get unique generations for filtering
  const generations = useMemo(() => {
    const genSet = new Set<number>();
    filteredMoves.forEach((move) => {
      genSet.add(move.versionGroup.generation.id);
    });
    return Array.from(genSet).sort((a, b) => a - b);
  }, [filteredMoves]);

  const moveTableColumns = useMemo(() => {
    const baseColumns: Column<PokemonMove>[] = [
      {
        header: 'Move',
        accessor: (row: PokemonMove) => {
          const moveName = row.move.names[0]?.name || capitalizeName(row.move.name);
          return (
            <>
              <div className="font-medium text-gray-900 dark:text-white">{moveName}</div>
              {row.move.priority !== 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Priority: {row.move.priority > 0 ? '+' : ''}
                  {row.move.priority}
                </div>
              )}
            </>
          );
        },
        className: 'p-3',
        sortable: true,
        sortKey: (row: PokemonMove) => row.move.name,
      },
      {
        header: 'Type',
        accessor: (row: PokemonMove) => (
          <span
            className="inline-block px-2 py-1 rounded text-white text-xs font-medium min-w-0"
            style={{ backgroundColor: getTypeColor(row.move.type.name) }}
          >
            {row.move.type.name.toUpperCase()}
          </span>
        ),
        className: 'p-3',
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
              <span className="hidden sm:inline">
                {row.move.moveDamageClass?.names[0]?.name || capitalizeName(damageClass)}
              </span>
            </span>
          );
        },
        className: 'p-3',
        sortable: true,
        sortKey: (row: PokemonMove) => row.move.moveDamageClass?.name || 'status',
      },
      {
        header: 'Power',
        accessor: (row: PokemonMove) => <>{row.move.power || '—'}</>,
        className: 'p-3 font-medium text-gray-900 dark:text-white',
        sortable: true,
        sortKey: (row: PokemonMove) => row.move.power || 0,
      },
      {
        header: 'Accuracy',
        accessor: (row: PokemonMove) => <>{row.move.accuracy ? `${row.move.accuracy}%` : '—'}</>,
        className: 'p-3 font-medium text-gray-900 dark:text-white',
        sortable: true,
        sortKey: (row: PokemonMove) => row.move.accuracy || 0,
      },
      {
        header: 'Effect Chance',
        accessor: (row: PokemonMove) => <>{row.move.effectChance ? `${row.move.effectChance}%` : '—'}</>,
        className: 'p-3 font-medium text-gray-900 dark:text-gray-300',
        sortable: true,
        sortKey: (row: PokemonMove) => row.move.effectChance || 0,
      },
      {
        header: 'PP',
        accessor: (row: PokemonMove) => <>{row.move.pp}</>,
        className: 'p-3 font-medium text-gray-900 dark:text-white',
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
          return (
            <div className="line-clamp-2">{description}</div>
          );
        },
        className: 'p-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs',
        sortable: false,
      },
    ];

    if (learnMethod === 'level-up') {
      return [
        {
          header: 'Level',
          accessor: (row: PokemonMove) => (
            <p className="p-3 font-medium text-gray-900 dark:text-white">
              {row.levelLearnedAt === 0 ? 'Evo' : row.levelLearnedAt}
            </p>
          ),
          className: 'p-3 font-medium text-gray-900 dark:text-white',
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          {learnMethodName || capitalizeName(learnMethod)} Moves
          <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
            ({filteredMoves.length} moves)
          </span>
        </h3>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Generation Filter */}
          {generations.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Generation:
              </label>
              <select
                value={selectedGeneration}
                onChange={(e) =>
                  setSelectedGeneration(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
                }
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All</option>
                {generations.map((gen) => (
                  <option key={gen} value={gen}>
                    Gen {gen}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <DataTable data={filteredMoves} columns={moveTableColumns} initialSortBy="name" />
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredMoves.map((pokemonMove: PokemonMove, index: number) => {
          const move = pokemonMove.move;
          const moveName = move.names[0]?.name || capitalizeName(move.name);
          const damageClass = move.moveDamageClass?.name || 'status';
          const description =
            move.effectEntries[0]?.shortEffect ||
            move.flavorTexts[0]?.flavorText ||
            'No description available';

          return (
            <div
              key={`${move.id}-${index}`}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
            >
              {/* Move Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{moveName}</h4>
                  {learnMethod === 'level-up' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
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
                  <span className="text-gray-600 dark:text-gray-400">Power:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {move.power || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {move.accuracy ? `${move.accuracy}%` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Effect Chance:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {move.effectChance ? `${move.effectChance}%` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">PP:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">{move.pp}</span>
                </div>
              </div>

              {/* Move Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>

              {/* Priority */}
              {move.priority !== 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No moves found for the selected criteria.</p>
        </div>
      )}
    </div>
  );
};

export default MoveTable;