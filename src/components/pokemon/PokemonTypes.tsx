import { getTypeColor } from '~/utils';

interface PokemonTypeEntry {
  type: {
    name: string;
    names: { name: string }[];
  };
}

interface ComponentProps {
  pokemon: {
    types: PokemonTypeEntry[];
  };
}

// Pokemon Types Component
export const PokemonTypes: React.FC<ComponentProps> = ({ pokemon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Types</h2>
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
    </div>
  );
};
