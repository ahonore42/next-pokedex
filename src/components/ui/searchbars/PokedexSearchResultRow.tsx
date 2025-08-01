'use client';

import Link from 'next/link';
import { capitalizeName } from '~/utils/text';
import Sprite from '../Sprite';
import TypeBadgesDisplay from '~/components/pokemon-types/TypeBadgesDisplay';
import { PokedexEntries } from '~/server/routers/_app';

export interface PokedexSearchResultRowProps {
  pokemonSpecies: PokedexEntries['pokemonSpecies'][number];
  onClick: () => void;
}

export default function PokedexSearchResultRow({
  pokemonSpecies,
  onClick,
}: PokedexSearchResultRowProps) {
  const pokemonName = pokemonSpecies.name;
  const pokemonSpeciesId = pokemonSpecies.id;
  const pokemonDefaultSprite = pokemonSpecies.pokemon[0].sprites?.frontDefault;
  const types = pokemonSpecies.pokemon[0].types.map((type) => type.type.name);
  return (
    <Link
      href={`/pokemon/${pokemonSpeciesId}`}
      className="flex items-center p-3 hover:bg-hover border-b border-border last:border-b-0 cursor-pointer transition-colors duration-300 block"
      onClick={onClick}
    >
      <Sprite src={pokemonDefaultSprite || ''} alt={pokemonName} variant="xs" />
      <div className="ml-3 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-primary">
            #{pokemonSpeciesId.toString().padStart(3, '0')}
          </span>
          <span className="text-muted">{capitalizeName(pokemonName)}</span>
        </div>
        <div className="flex gap-1 mt-1">
          <TypeBadgesDisplay types={types} />
        </div>
      </div>
    </Link>
  );
}

// Render Pokemon search results
export const renderPokedexResult = (
  pokemonSpecies: PokedexEntries['pokemonSpecies'][number],
  onResultClick: () => void,
) => <PokedexSearchResultRow pokemonSpecies={pokemonSpecies} onClick={onResultClick} />;

export const pokedexFilter = (
  species: PokedexEntries['pokemonSpecies'][number],
  query: string,
): boolean => {
  if (!query.trim()) return false;

  const lower = query.toLowerCase();

  // 1) Exact or partial name match in any language
  const nameMatch =
    species.name.toLowerCase().includes(lower) ||
    species.names.some((n) => n.name.toLowerCase().includes(lower));

  // 2) National-dex number match (001, 25, etc.)
  const dexMatch = species.id.toString() === query.trim();

  return nameMatch || dexMatch;
};
