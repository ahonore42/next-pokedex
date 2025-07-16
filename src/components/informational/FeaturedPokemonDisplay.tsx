import { capitalizeName } from '~/utils/text';
import SectionCard from '../ui/SectionCard';
import { PokemonListOutput } from '~/server/routers/_app';
import { TypeBadge } from '../ui/TypeBadge';
import Link from 'next/link';

export default function FeaturedPokemonDisplay({
  pokemon,
}: {
  pokemon: PokemonListOutput['pokemon'];
}) {
  return (
    <SectionCard title="Featured Pokémon" tag="Daily Rotation" >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pokemon.map((pkmn) => (
          <Link
            key={pkmn.id}
            href={`/pokemon/${pkmn.id}`}
            className="
              group block p-4 border rounded-lg
              bg-pokemon hover:bg-pokemon-hover
              border-pokemon-border hover:border-pokemon-border-hover
              hover:shadow-md hover:-translate-y-1
              transition-all duration-300
              active:scale-95 
            "
            aria-label={`View details for ${capitalizeName(pkmn.name)}`}
          >
            <div className="flex items-start gap-3">
              <img
                src={pkmn.sprites?.frontDefault || ''}
                alt={pkmn.name}
                className="w-16 h-16 object-contain flex-shrink-0 group-hover:scale-110"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-pokemon-text-muted">
                    #{pkmn.id.toString().padStart(3, '0')}
                  </span>
                  <span className="font-semibold text-pokemon-text">
                    {capitalizeName(pkmn.name)}
                  </span>
                </div>
                <div className="flex gap-1 mb-2">
                  {pkmn.types.map((pokemonType) => (
                    <TypeBadge key={pokemonType.type.name} type={pokemonType.type} link={false} />
                  ))}
                </div>
                <p className="text-xs line-clamp-2 text-pokemon-text-muted">
                  {pkmn.pokemonSpecies.flavorTexts[0].flavorText ?? ''}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
