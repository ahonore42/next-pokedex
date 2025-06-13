import { getTypeColor, capitalizeName } from '~/lib/services/pokemon';
import SectionCard from '../ui/SectionCard';
import { PokemonArray } from '~/server/routers/_app';

export default function FeaturedPokemonDisplay({
  pokemon,
}: {
  pokemon: PokemonArray;
}) {
  return (
    <SectionCard title="Featured Pokémon" tag="Daily Rotation">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-4">
        {pokemon.map((pkmn) => (
          <a
            key={pkmn.id}
            href={`/pokemon/${pkmn.id}`}
            className="
              group block p-4 border rounded-lg
              hover:shadow-md hover:-translate-y-1
              transition-all duration-300
              active:scale-95
            "
            style={{
              backgroundColor: 'var(--color-pokemon-card-bg)',
              borderColor: 'var(--color-pokemon-card-border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'var(--color-pokemon-card-hover-bg)';
              e.currentTarget.style.borderColor =
                'var(--color-pokemon-card-hover-border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                'var(--color-pokemon-card-bg)';
              e.currentTarget.style.borderColor =
                'var(--color-pokemon-card-border)';
            }}
            aria-label={`View details for ${capitalizeName(pkmn.name)}`}
          >
            <div className="flex items-start gap-3">
              <img
                src={pkmn.sprites?.frontDefault || ''}
                alt={pkmn.name}
                className="w-16 h-16 object-contain flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: 'var(--color-pokemon-card-text-secondary)',
                    }}
                  >
                    #{pkmn.id.toString().padStart(3, '0')}
                  </span>
                  <span
                    className="font-semibold"
                    style={{ color: 'var(--color-pokemon-card-text)' }}
                  >
                    {capitalizeName(pkmn.name)}
                  </span>
                </div>
                <div className="flex gap-1 mb-2">
                  {pkmn.types.map((pokemonType) => (
                    <span
                      key={pokemonType.type.name}
                      className="px-2 py-0.5 text-xs rounded text-white font-medium hover:scale-105 transition-transform duration-200"
                      style={{
                        backgroundColor: getTypeColor(pokemonType.type.name),
                      }}
                    >
                      {pokemonType.type.name.toUpperCase()}
                    </span>
                  ))}
                </div>
                <p
                  className="text-xs line-clamp-2"
                  style={{ color: 'var(--color-pokemon-card-text-secondary)' }}
                >
                  {pkmn.pokemonSpecies.flavorTexts[0].flavorText}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </SectionCard>
  );
}
