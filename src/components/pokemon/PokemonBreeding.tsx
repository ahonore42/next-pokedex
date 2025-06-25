import { capitalizeName } from '~/utils/pokemon';
import type { PokemonDetailedById } from '~/server/routers/_app';

interface ComponentProps {
  pokemon: PokemonDetailedById;
}

// Pokemon Breeding Component
export const PokemonBreeding: React.FC<ComponentProps> = ({ pokemon }) => {
  const species = pokemon.pokemonSpecies;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Breeding</h2>

      <div className="space-y-4">
        {/* Egg Groups */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Egg Groups</h3>
          <div className="flex flex-wrap gap-2">
            {species.eggGroups.map((eggGroupEntry) => (
              <span
                key={eggGroupEntry.eggGroup.id}
                className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
              >
                {eggGroupEntry.eggGroup.names[0]?.name ||
                  capitalizeName(eggGroupEntry.eggGroup.name)}
              </span>
            ))}
          </div>
        </div>

        {/* Gender Rate */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Gender Ratio</h3>
          <div className="text-gray-700 dark:text-gray-300">
            {species.genderRate === -1 ? (
              <span>Genderless</span>
            ) : (
              <div className="flex items-center space-x-2">
                <span>♂ {(((8 - species.genderRate) / 8) * 100).toFixed(1)}%</span>
                <span>♀ {((species.genderRate / 8) * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Hatch Counter */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Hatch Time</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {species.hatchCounter} cycles ({species.hatchCounter * 256} steps)
          </p>
        </div>
      </div>
    </div>
  );
};
