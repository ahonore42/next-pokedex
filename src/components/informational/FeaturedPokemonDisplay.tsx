import { useComponentHydration } from '~/hooks/useComponentHydration';
import { FeaturedPokemon, FeaturedPokemonOutput } from '~/server/routers/_app';
import { capitalizeWords } from '~/utils';
import SectionCard from '../ui/SectionCard';
import InteractiveLink from '../ui/InteractiveLink';
import Sprite from '../ui/Sprite';
import TypeBadgesDisplay from '../pokemon-types/TypeBadgesDisplay';

interface FeaturedPokemonDisplayProps {
  pokemon: FeaturedPokemonOutput;
}

export default function FeaturedPokemonDisplay({ pokemon }: FeaturedPokemonDisplayProps) {
  const { containerRef, allDataLoaded, handleDataLoad } = useComponentHydration(
    pokemon.length,
    'pokemon',
  );

  return (
    <SectionCard title="Featured Pokémon" tags={['Daily Rotation']} colorVariant="transparent">
      <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pokemon.map((pkmn: FeaturedPokemon) => {
          const pokemonName = capitalizeWords(pkmn.name.replaceAll('-', ' '));
          const types = pkmn.types.map((type) => type.type.name);
          return (
            <InteractiveLink
              key={pkmn.id}
              href={`/pokemon/${pkmn.id}`}
              height="lg"
              ariaLabel={`View details for ${pokemonName}`}
              loading={!allDataLoaded}
              onDataLoad={handleDataLoad}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold">{pokemonName}</h3>
                <TypeBadgesDisplay types={types} />
              </div>
              <div className="flex items-center gap-2">
                <div className="group-hover:scale-110 transition-interactive">
                  <Sprite
                    variant="sm"
                    src={pkmn.sprites?.frontDefault || ''}
                    alt={`${pokemonName} Sprite`}
                    className="flex-auto"
                  />
                </div>
                <span className="line-clamp-3 text-muted text-sm">
                  {pkmn.pokemonSpecies.flavorTexts[0].flavorText}
                </span>
              </div>
            </InteractiveLink>
          );
        })}
      </div>
    </SectionCard>
  );
}
