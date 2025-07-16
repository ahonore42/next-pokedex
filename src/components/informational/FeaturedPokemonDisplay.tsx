import { PokemonListOutput } from '~/server/routers/_app';
import SectionCard from '../ui/SectionCard';
import InteractiveLink from '../ui/InteractiveLink';
import TypeBadgesDisplay from '../pokemon-types/TypeBadgesDisplay';

export default function FeaturedPokemonDisplay({
  pokemon,
}: {
  pokemon: PokemonListOutput['pokemon'];
}) {
  return (
    <SectionCard title="Featured Pokémon" tag="Daily Rotation">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pokemon.map((pkmn: PokemonListOutput['pokemon'][number]) => (
          <InteractiveLink
            key={pkmn.id}
            href={`/pokemon/${pkmn.id}`}
            icon={
              <img
                src={pkmn.sprites?.frontDefault || ''}
                alt={pkmn.name}
                className="w-16 h-16 object-contain"
              />
            }
            title={pkmn.name}
            description={
              <>
                <TypeBadgesDisplay types={pkmn.types} className="mb-2" />
                <p className="line-clamp-2">{pkmn.pokemonSpecies.flavorTexts[0].flavorText}</p>
              </>
            }
            ariaLabel={`View details for ${pkmn.name}`}
          />
        ))}
      </div>
    </SectionCard>
  );
}
