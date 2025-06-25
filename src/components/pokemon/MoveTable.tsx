import { useState, useMemo } from 'react';
import { getTypeColor, capitalizeName } from '~/utils/pokemon';
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
  const [sortBy, setSortBy] = useState<'level' | 'name' | 'power' | 'accuracy'>('level');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  // Filter and sort moves
  const processedMoves = useMemo(() => {
    let processed = filteredMoves;

    // Filter by generation
    if (selectedGeneration !== 'all') {
      processed = processed.filter(
        (move) => move.versionGroup.generation.id === selectedGeneration,
      );
    }

    // Remove duplicates (same move in different version groups)
    const moveMap = new Map<number, PokemonMove>();
    processed.forEach((move) => {
      const existingMove = moveMap.get(move.move.id);
      if (
        !existingMove ||
        move.versionGroup.generation.id > existingMove.versionGroup.generation.id
      ) {
        moveMap.set(move.move.id, move);
      }
    });
    processed = Array.from(moveMap.values());

    // Sort moves
    processed.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'level':
          comparison = a.levelLearnedAt - b.levelLearnedAt;
          break;
        case 'name':
          comparison = (a.move.names[0]?.name || a.move.name).localeCompare(
            b.move.names[0]?.name || b.move.name,
          );
          break;
        case 'power':
          comparison = (a.move.power || 0) - (b.move.power || 0);
          break;
        case 'accuracy':
          comparison = (a.move.accuracy || 0) - (b.move.accuracy || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return processed;
  }, [filteredMoves, selectedGeneration, sortBy, sortOrder]);

  // Get damage class icon
  const getDamageClassIcon = (damageClass: string) => {
    switch (damageClass) {
      case 'physical':
        return '💥'; // Physical
      case 'special':
        return '🌀'; // Special
      case 'status':
        return '⚡'; // Status
      default:
        return '❓';
    }
  };

  // Get damage class color
  const getDamageClassColor = (damageClass: string) => {
    switch (damageClass) {
      case 'physical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'special':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'status':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Handle sort change
  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  if (processedMoves.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          {learnMethodName || capitalizeName(learnMethod)} Moves
          <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
            ({processedMoves.length} moves)
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

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {learnMethod === 'level-up' && <option value="level">Level</option>}
              <option value="name">Name</option>
              <option value="power">Power</option>
              <option value="accuracy">Accuracy</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-600">
              {learnMethod === 'level-up' && (
                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                  <button
                    onClick={() => handleSort('level')}
                    className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Level
                    {sortBy === 'level' && (
                      <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
              )}
              <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Move
                  {sortBy === 'name' && (
                    <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">Type</th>
              <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                Category
              </th>
              <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                <button
                  onClick={() => handleSort('power')}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Power
                  {sortBy === 'power' && (
                    <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                <button
                  onClick={() => handleSort('accuracy')}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Accuracy
                  {sortBy === 'accuracy' && (
                    <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                Effect Chance
              </th>
              <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">PP</th>
              <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {processedMoves.map((pokemonMove, index) => {
              const move = pokemonMove.move;
              const moveName = move.names[0]?.name || capitalizeName(move.name);
              const damageClass = move.moveDamageClass?.name || 'status';
              const description =
                move.effectEntries[0]?.shortEffect ||
                move.flavorTexts[0]?.flavorText ||
                'No description available';

              return (
                <tr
                  key={`${move.id}-${index}`}
                  className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {learnMethod === 'level-up' && (
                    <td className="p-3 font-medium text-gray-900 dark:text-white">
                      {pokemonMove.levelLearnedAt === 0 ? 'Evo' : pokemonMove.levelLearnedAt}
                    </td>
                  )}
                  <td className="p-3">
                    <div className="font-medium text-gray-900 dark:text-white">{moveName}</div>
                    {move.priority !== 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Priority: {move.priority > 0 ? '+' : ''}
                        {move.priority}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className="inline-block px-2 py-1 rounded text-white text-xs font-medium min-w-0"
                      style={{ backgroundColor: getTypeColor(move.type.name) }}
                    >
                      {move.type.name.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getDamageClassColor(damageClass)}`}
                    >
                      <span>{getDamageClassIcon(damageClass)}</span>
                      <span className="hidden sm:inline">
                        {move.moveDamageClass?.names[0]?.name || capitalizeName(damageClass)}
                      </span>
                    </span>
                  </td>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    {move.power || '—'}
                  </td>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    {move.accuracy ? `${move.accuracy}%` : '—'}
                  </td>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    {move.effectChance ? `${move.effectChance}%` : '—'}
                  </td>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">{move.pp}</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                    <div className="line-clamp-2">{description}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {processedMoves.map((pokemonMove, index) => {
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
      {processedMoves.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No moves found for the selected criteria.</p>
        </div>
      )}
    </div>
  );
};

export default MoveTable;
