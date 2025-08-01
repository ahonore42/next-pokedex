'use client';

import Link from 'next/link';
import { capitalizeName } from '~/utils/text';
import { type PokemonSearchResult } from './searchbar.config';
import Sprite from '../Sprite';
import TypeBadgesDisplay from '~/components/pokemon-types/TypeBadgesDisplay';

export interface PokemonSearchResultRowProps {
  pokemon: PokemonSearchResult;
  onClick: () => void;
}

export default function PokemonSearchResultRow({ pokemon, onClick }: PokemonSearchResultRowProps) {
  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      className="flex items-center p-3 hover:bg-hover border-b border-border last:border-b-0 cursor-pointer transition-colors duration-300 block"
      onClick={onClick}
    >
      <Sprite src={pokemon.sprites?.frontDefault || ''} alt={pokemon.name} variant="xs" />
      <div className="ml-3 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-primary">
            #{pokemon.pokemonSpecies.id.toString().padStart(3, '0')}
          </span>
          <span className="text-muted">{capitalizeName(pokemon.name)}</span>
        </div>
        <div className="flex gap-1 mt-1">
          <TypeBadgesDisplay types={pokemon.types.map((t) => t.type.name)} />
        </div>
      </div>
    </Link>
  );
}

// Render Pokemon search results
export const renderPokemonResult = (pokemon: PokemonSearchResult, onResultClick: () => void) => (
  <PokemonSearchResultRow pokemon={pokemon} onClick={onResultClick} />
);
