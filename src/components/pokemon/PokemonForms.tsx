import TypeBadgesDisplay from '../pokemon-types/TypeBadgesDisplay';

interface FormItem {
  id: number;
  name: string;
  isDefault: boolean;
  names: { name: string; pokemonName: string }[];
  types: { type: { name: string } }[];
  sprites: { frontDefault: string | null } | null;
}

interface ComponentProps {
  pokemonForms: FormItem[];
}

// Pokemon Forms Component
export const PokemonForms: React.FC<ComponentProps> = ({ pokemonForms }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Forms</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pokemonForms.map((form) => {
          const types = form.types.map((type) => type.type.name);
          return (
            <div
              key={form.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                  {form.names[0]?.name || form.name}
                </h3>
                {form.isDefault && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                    Default
                  </span>
                )}
              </div>

              {form.sprites?.frontDefault && (
                <img
                  src={form.sprites.frontDefault}
                  alt={`${form.name} sprite`}
                  className="w-20 h-20 mx-auto mb-3"
                />
              )}

              <TypeBadgesDisplay types={types} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
