import { getTypeColor } from '~/utils';
import type { PokemonInSpecies } from '~/server/routers/_app';

interface ComponentProps {
  pokemon: PokemonInSpecies;
}

// Pokemon Types Component
export const PokemonTypes: React.FC<ComponentProps> = ({ pokemon }) => {
  const hasHistoricalTypes = pokemon.typePast.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Types</h2>

      {/* Current Types */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Current</h3>
        <div className="flex flex-wrap gap-3">
          {pokemon.types.map((pokemonType) => (
            <div
              key={pokemonType.type.name}
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: getTypeColor(pokemonType.type.name) }}
            >
              {pokemonType.type.names[0]?.name || pokemonType.type.name.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Historical Types */}
      {hasHistoricalTypes && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Historical Types
          </h3>
          <div className="space-y-3">
            {pokemon.typePast.map((pastType, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-0 flex-shrink-0">
                  {pastType.generation.name || pastType.generation.name}:
                </span>
                <div
                  className="px-3 py-1 rounded text-white font-medium text-sm"
                  style={{ backgroundColor: getTypeColor(pastType.type.name) }}
                >
                  {pastType.type.names[0]?.name || pastType.type.name.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
