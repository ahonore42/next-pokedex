import type { PokemonInSpecies } from '~/server/routers/_app';
import SectionCard from '../ui/SectionCard';

interface PokemonAbilitiesProps {
  pokemon: PokemonInSpecies;
}
// Pokemon Abilities
export default function PokemonAbilities({ pokemon }: PokemonAbilitiesProps) {
  const normalAbilities = pokemon.abilities.filter((a) => !a.isHidden);
  const hiddenAbilities = pokemon.abilities.filter((a) => a.isHidden);

  return (
    <div className="flex flex-col justify-center gap-4">
      {/* Normal Abilities */}
      {normalAbilities.map((pokemonAbility) => (
        <SectionCard
          key={pokemonAbility.ability.id}
          title={pokemonAbility.ability.names[0]?.name || pokemonAbility.ability.name}
          variant="compact"
          colorVariant="info"
          tags={['Normal']}
          className=""
        >
          {pokemonAbility.ability.flavorTexts[0]?.flavorText && (
            <p className="text-primary text-sm">
              {pokemonAbility.ability.flavorTexts[0].flavorText}
            </p>
          )}
          {pokemonAbility.ability.effectTexts[0]?.shortEffect && (
            <p className="text-subtle text-sm">
              - {pokemonAbility.ability.effectTexts[0].shortEffect}
            </p>
          )}
        </SectionCard>
      ))}

      {/* Hidden Abilities */}
      {hiddenAbilities.length > 0 &&
        hiddenAbilities.map((pokemonAbility) => (
          <SectionCard
            key={pokemonAbility.ability.id}
            title={pokemonAbility.ability.names[0]?.name || pokemonAbility.ability.name}
            variant="compact"
            colorVariant="highlight"
            tags={['Hidden']}
            className=""
          >
            {pokemonAbility.ability.flavorTexts[0]?.flavorText && (
              <p className="text-primary text-sm">
                {pokemonAbility.ability.flavorTexts[0].flavorText}
              </p>
            )}
            {pokemonAbility.ability.effectTexts[0]?.shortEffect && (
              <p className="text-subtle text-sm">
                - {pokemonAbility.ability.effectTexts[0].shortEffect}
              </p>
            )}
          </SectionCard>
        ))}
    </div>
  );
}
