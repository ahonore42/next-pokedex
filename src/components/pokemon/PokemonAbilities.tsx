import type { PokemonInSpecies } from '~/server/routers/_app';
import SectionCard from '../ui/SectionCard';

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
      {normalAbilities.map((pokemonAbility) => (
        <SectionCard
          title={pokemonAbility.ability.names[0]?.name || pokemonAbility.ability.name}
          variant="compact"
          colorVariant="info"
          tag="Normal"
          className="space-y-4 mb-6"
        >
          {pokemonAbility.ability.flavorTexts[0]?.flavorText && (
            <p className="text-subtle text-sm">
              {pokemonAbility.ability.flavorTexts[0].flavorText}
            </p>
          )}
          {pokemonAbility.ability.effectTexts[0]?.shortEffect && (
            <p className="text-subtle text-sm mt-2">
              {pokemonAbility.ability.effectTexts[0].shortEffect}
            </p>
          )}
        </SectionCard>
      ))}

      {/* Hidden Abilities */}
      {hiddenAbilities.length > 0 &&
        hiddenAbilities.map((pokemonAbility) => (
          <SectionCard
            title={pokemonAbility.ability.names[0]?.name || pokemonAbility.ability.name}
            variant="compact"
            colorVariant="highlight"
            tag="Hidden"
            className="space-y-4"
          >
            {pokemonAbility.ability.flavorTexts[0]?.flavorText && (
              <p className="text-subtle text-sm">
                {pokemonAbility.ability.flavorTexts[0].flavorText}
              </p>
            )}
            {pokemonAbility.ability.effectTexts[0]?.shortEffect && (
              <p className="text-subtle text-sm mt-2">
                {pokemonAbility.ability.effectTexts[0].shortEffect}
              </p>
            )}
          </SectionCard>
        ))}
    </>
  );
};
