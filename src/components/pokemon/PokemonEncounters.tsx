import type { PokemonDetailedById } from '~/server/routers/_app';

interface ComponentProps {
  pokemon: PokemonDetailedById;
}

// Pokemon Encounters Component (Simplified)
export const PokemonEncounters: React.FC<ComponentProps> = ({ pokemon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Locations</h2>
      <div className="text-center text-gray-600 dark:text-gray-400">
        <p>Total Encounters: {pokemon.encounters.length}</p>
        <p className="text-sm mt-2">Encounter details will be implemented in the next iteration</p>
      </div>
    </div>
  );
};
