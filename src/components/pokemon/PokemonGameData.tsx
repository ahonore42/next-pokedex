import { capitalizeName } from '~/utils/text';
import type { PokemonSpeciesByIdOutput } from '~/server/routers/_app';

interface ComponentProps {
  pokedexNumbers: PokemonSpeciesByIdOutput['pokedexNumbers'];
  captureRate: PokemonSpeciesByIdOutput['captureRate'];
  baseHappiness: PokemonSpeciesByIdOutput['baseHappiness'];
}

// Pokemon Game Data Component
export const PokemonGameData: React.FC<ComponentProps> = ({
  pokedexNumbers,
  captureRate,
  baseHappiness,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Game Data</h2>

      <div className="space-y-4">
        {/* Pokedex Numbers */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pokédex Numbers</h3>
          <div className="space-y-2">
            {pokedexNumbers.slice(0, 5).map((entry) => (
              <div key={entry.pokedex.id} className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">
                  {entry.pokedex.names[0]?.name || capitalizeName(entry.pokedex.name)}
                </span>
                <span className="font-mono text-gray-900 dark:text-white">
                  #{entry.pokedexNumber.toString().padStart(3, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Capture Rate */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Capture Rate</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {captureRate} ({((captureRate / 255) * 100).toFixed(1)}%)
          </p>
        </div>

        {/* Base Happiness */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Base Happiness</h3>
          <p className="text-gray-700 dark:text-gray-300">{baseHappiness}</p>
        </div>
      </div>
    </div>
  );
};
