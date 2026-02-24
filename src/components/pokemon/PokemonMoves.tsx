import { useMemo } from 'react';
import { pokemonMovesConfig, useGenerationFilter } from '~/hooks';
import { getMethodDisplayName, sortMovesByMethod } from '~/utils/pokemon';
import type { PokemonMoves } from '~/server/routers/_app';
import GenerationFilter from '../pokedex/GenerationFilter';
import MetricsGrid from '../ui/MetricsGrid';
import MoveTable from './MoveTable';

interface PokemonMovesProps {
  moves: PokemonMoves;
}

// Pokemon Moves Component
export default function PokemonMoves({ moves }: PokemonMovesProps) {
  const {
    selectedGenerationId,
    setSelectedGenerationId,
    filteredItems: filteredMoves,
    availableGenerations,
  } = useGenerationFilter(moves, pokemonMovesConfig);

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

  // Sort methods by predefined order, then alphabetically
  const sortedMethods = sortMovesByMethod(movesByMethod);

  return (
    <div className="">
      <div className="grid grid-cols-1 gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        {moves.length > 0 && (
          <GenerationFilter
            title="Moves"
            titleClassName="text-xl font-bold text-primary" // Custom styling for moves
            selectedGenerationId={selectedGenerationId}
            setSelectedGenerationId={setSelectedGenerationId}
            availableGenerations={availableGenerations}
          />
        )}
        {/* Move Statistics */}
        <MetricsGrid
          metrics={[
            { label: 'Total Moves', value: filteredMoves.length },
            { label: 'Learn Methods', value: Object.keys(movesByMethod).length },
            { label: 'Level-Up Moves', value: movesByMethod['level-up']?.length || 0 },
            { label: 'TM Moves', value: movesByMethod.machine?.length || 0 },
          ]}
          columns={{ default: 2, sm: 4 }}
        />

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
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <p className="text-gray-600 dark:text-gray-400">
                No moves found for {`Generation ${selectedGenerationId}`}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
