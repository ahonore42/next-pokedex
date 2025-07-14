import { getTypeColor } from '~/utils/pokemon';
import { capitalizeName } from '~/utils/text';
import type { PokemonInSpecies } from '~/server/routers/_app';

interface ComponentProps {
  pokemonForms: PokemonInSpecies['forms'];
}

// Pokemon Forms Component
export const PokemonForms: React.FC<ComponentProps> = ({ pokemonForms }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Forms</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pokemonForms.map((form) => (
          <div key={form.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {form.names[0]?.name || capitalizeName(form.name)}
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

            <div className="flex flex-wrap gap-1">
              {form.types.map((formType) => (
                <span
                  key={formType.type.name}
                  className="px-2 py-1 rounded text-white text-xs font-medium"
                  style={{ backgroundColor: getTypeColor(formType.type.name) }}
                >
                  {formType.type.name.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
