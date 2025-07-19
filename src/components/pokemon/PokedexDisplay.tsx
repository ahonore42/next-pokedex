import type { PokedexEntries } from '~/server/routers/_app';
import SpriteLink from '../ui/SpriteLink';

interface PokedexDisplayProps {
  pokedex: PokedexEntries;
}

export default function PokedexDisplay({ pokedex }: PokedexDisplayProps) {
  if (!pokedex) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {pokedex.pokemonSpecies.map((pokemonSpecies: PokedexEntries['pokemonSpecies'][number]) => {
        const pokedexNumber = String(pokemonSpecies.pokedexNumbers[0].pokedexNumber);
        const pokemonName = pokemonSpecies.name;
        const pokemonSpeciesId = pokemonSpecies.id;
        const pokemonDefaultSprite = pokemonSpecies.pokemon[0].sprites?.frontDefault;
        return (
          <SpriteLink
            key={pokemonName}
            href={`/pokemon/${pokemonSpeciesId}`}
            src={pokemonDefaultSprite || ''}
            title={pokemonName}
            prefix={pokedexNumber}
          />
        );
      })}
    </div>
  );
}
