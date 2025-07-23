import { useState, useMemo } from 'react';
import type { PokemonInSpecies } from '~/server/routers/_app';
import MoveTable from './MoveTable';

interface PokemonMovesProps {
  pokemon: PokemonInSpecies;
}

// Pokemon Moves Component
export default function PokemonMoves({ pokemon }: PokemonMovesProps) {
  // Generation filtering state - default to generation 9 (latest)
  const [selectedGenerationId, setSelectedGenerationId] = useState<number>(9);

  // Filter moves by selected generation and deduplicate by move ID
  const filteredMoves = useMemo(() => {
    // First filter by generation
    const generationMoves = pokemon.moves.filter(
      (move) => move.versionGroup.generation.id === selectedGenerationId,
    );

    // Deduplicate by move ID, keeping the move from the latest version group
    const moveMap = new Map();

    generationMoves.forEach((pokemonMove) => {
      const moveId = pokemonMove.move.id;
      const existing = moveMap.get(moveId);

      // If no existing move or current version group is newer, use this one
      if (!existing || pokemonMove.versionGroup.order > existing.versionGroup.order) {
        moveMap.set(moveId, pokemonMove);
      }
    });

    return Array.from(moveMap.values());
  }, [pokemon.moves, selectedGenerationId]);

  // Get available generations for this Pokemon
  const availableGenerations = useMemo(() => {
    const generations = new Set(pokemon.moves.map((move) => move.versionGroup.generation.id));
    return Array.from(generations).sort((a, b) => a - b);
  }, [pokemon.moves]);

  // Group filtered moves by learn method
  const movesByMethod = useMemo(() => {
    return filteredMoves.reduce(
      (acc, pokemonMove) => {
        const method = pokemonMove.moveLearnMethod.name;
        if (!acc[method]) {
          acc[method] = [];
        }
        acc[method].push(pokemonMove);
        return acc;
      },
      {} as Record<string, typeof filteredMoves>,
    );
  }, [filteredMoves]);

  // Define the order of learn methods for display
  const methodOrder = [
    'level-up',
    'machine', // TMs/TRs
    'egg',
    'tutor',
    'transfer',
    'light-ball-egg',
    'colosseum-purification',
    'xd-shadow',
    'xd-purification',
    'form-change',
    'zygarde-cube',
  ];

  // Get learn method display name
  const getMethodDisplayName = (method: string, moves: typeof filteredMoves) => {
    const methodData = moves[0]?.moveLearnMethod;
    const displayName = methodData?.names[0]?.name || method;
    // Add specific handling for common methods
    switch (method) {
      case 'level-up':
        return 'Level Up';
      case 'machine':
        return 'TM/HM';
      case 'egg':
        return 'Egg Moves';
      case 'tutor':
        return 'Move Tutor';
      case 'transfer':
        return 'Transfer Only';
      default:
        return displayName.replaceAll('-', ' ');
    }
  };

  // Sort methods by predefined order, then alphabetically
  const sortedMethods = Object.keys(movesByMethod).sort((a, b) => {
    const aIndex = methodOrder.indexOf(a);
    const bIndex = methodOrder.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    } else if (aIndex !== -1) {
      return -1;
    } else if (bIndex !== -1) {
      return 1;
    } else {
      return a.localeCompare(b);
    }
  });

  // Generation display names
  const getGenerationDisplayName = (genId: number) => {
    const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
    return `Generation ${romanNumerals[genId] || genId}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Moves</h2>

          {/* Generation Selector */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="generation-select"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Generation:
            </label>
            <select
              id="generation-select"
              value={selectedGenerationId}
              onChange={(e) => setSelectedGenerationId(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableGenerations.map((genId) => (
                <option key={genId} value={genId}>
                  {getGenerationDisplayName(genId)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Move Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Moves</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {filteredMoves.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Learn Methods</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {Object.keys(movesByMethod).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Level-Up Moves</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {movesByMethod['level-up']?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">TM Moves</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {movesByMethod.machine?.length || 0}
            </p>
          </div>
        </div>

        {/* Generation Info */}
        <div className="mt-4 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            Showing moves from {getGenerationDisplayName(selectedGenerationId)}
          </span>
        </div>
      </div>

      {/* Render MoveTable for each learn method with filtered moves */}
      {sortedMethods.map((method) => (
        <MoveTable
          key={method}
          moves={movesByMethod[method]}
          learnMethod={method}
          learnMethodName={getMethodDisplayName(method, movesByMethod[method])}
        />
      ))}

      {/* Empty State */}
      {filteredMoves.length === 0 && (
        <div className="text-center py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <p className="text-gray-600 dark:text-gray-400">
              No moves found for {getGenerationDisplayName(selectedGenerationId)}.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Try selecting a different generation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
