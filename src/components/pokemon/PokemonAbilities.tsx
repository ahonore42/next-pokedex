import type { PokemonInSpecies } from '~/server/routers/_app';

interface ComponentProps {
  pokemon: PokemonInSpecies;
}
// Pokemon Abilities
export const PokemonAbilities: React.FC<ComponentProps> = ({ pokemon }) => {
  const normalAbilities = pokemon.abilities.filter((a) => !a.isHidden);
  const hiddenAbilities = pokemon.abilities.filter((a) => a.isHidden);

  return (
    <>
      {/* Normal Abilities */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Normal Abilities
        </h3>
        <div className="space-y-4">
          {normalAbilities.map((pokemonAbility) => (
            <div
              key={pokemonAbility.ability.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 capitalize">
                {pokemonAbility.ability.names[0]?.name || pokemonAbility.ability.name}
              </h4>
              {pokemonAbility.ability.flavorTexts[0]?.flavorText && (
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {pokemonAbility.ability.flavorTexts[0].flavorText}
                </p>
              )}
              {pokemonAbility.ability.effectTexts[0]?.shortEffect && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                  {pokemonAbility.ability.effectTexts[0].shortEffect}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hidden Abilities */}
      {hiddenAbilities.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Hidden Abilities
          </h3>
          <div className="space-y-4">
            {hiddenAbilities.map((pokemonAbility) => (
              <div
                key={pokemonAbility.ability.id}
                className="border border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center capitalize">
                  {pokemonAbility.ability.names[0]?.name || pokemonAbility.ability.name}
                  <span className="ml-2 px-2 py-1 bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 rounded text-xs">
                    Hidden
                  </span>
                </h4>
                {pokemonAbility.ability.flavorTexts[0]?.flavorText && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {pokemonAbility.ability.flavorTexts[0].flavorText}
                  </p>
                )}
                {pokemonAbility.ability.effectTexts[0]?.shortEffect && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                    {pokemonAbility.ability.effectTexts[0].shortEffect}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
