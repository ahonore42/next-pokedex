import type { PokemonSpeciesByIdOutput } from '~/server/routers/_app';

interface ComponentProps {
  eggGroups: PokemonSpeciesByIdOutput['eggGroups'];
  genderRate: PokemonSpeciesByIdOutput['genderRate'];
  hatchCounter: PokemonSpeciesByIdOutput['hatchCounter'];
}

// Pokemon Breeding Component
export const PokemonBreeding: React.FC<ComponentProps> = ({
  eggGroups,
  genderRate,
  hatchCounter,
}) => {
  return (
    <div className="flex flex-wrap gap-6">
      {/* Egg Groups */}
      <div className="min-w-32 flex-grow">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 whitespace-nowrap">
          Egg Groups
        </h3>
        <div className="flex flex-nowrap gap-2">
          {eggGroups.map((eggGroupEntry) => (
            <span
              key={eggGroupEntry.eggGroup.id}
              className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm whitespace-nowrap capitalize"
            >
              {eggGroupEntry.eggGroup.names[0]?.name || eggGroupEntry.eggGroup.name}
            </span>
          ))}
        </div>
      </div>

      {/* Gender Rate */}
      <div className="min-w-32 flex-grow">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 whitespace-nowrap">
          Gender Ratio
        </h3>
        <div className="text-gray-700 dark:text-gray-300">
          {genderRate === -1 ? (
            <span className="whitespace-nowrap">Genderless</span>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="whitespace-nowrap">
                ♂ {(((8 - genderRate) / 8) * 100).toFixed(1)}%
              </span>
              <span className="whitespace-nowrap">♀ {((genderRate / 8) * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Hatch Counter */}
      <div className="min-w-32 flex-grow">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 whitespace-nowrap">
          Hatch Time
        </h3>
        <p className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {hatchCounter} cycles ({hatchCounter * 256} steps)
        </p>
      </div>
    </div>
  );
};
