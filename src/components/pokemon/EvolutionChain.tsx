import type { PokemonDetailedById } from '~/server/routers/_app';

interface ComponentProps {
  pokemon: PokemonDetailedById;
}

// Evolution Chain Component
export const EvolutionChain: React.FC<ComponentProps> = ({ pokemon }) => {
  const evolutionChain = pokemon.pokemonSpecies.evolutionChain;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Evolution</h2>
      <div className="text-center text-gray-600 dark:text-gray-400">
        <p>Evolution Chain ID: {evolutionChain?.id}</p>
        <p className="text-sm mt-2">Evolution tree will be implemented in the next iteration</p>
      </div>
    </div>
  );
};
