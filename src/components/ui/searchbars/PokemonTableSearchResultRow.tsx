'use client';

import Link from 'next/link';
import { capitalizeName } from '~/utils/text';
import { PokemonColumns } from '~/components/ui/tables';
import Sprite from '../Sprite';
import TypeBadgesDisplay from '~/components/pokemon-types/TypeBadgesDisplay';

export interface PokemonTableSearchResultRowProps {
  pokemon: PokemonColumns;
  onClick: () => void;
  searchQuery?: string;
}

// Helper function to determine what was matched
const getMatchBadge = (pokemon: PokemonColumns, query: string): string | null => {
  if (!query.trim()) return null;

  const lower = query.toLowerCase();

  // Check species ID match first (most specific)
  if (pokemon.speciesId.toString().includes(query.trim())) {
    return 'Number';
  }

  // Check name match
  if (pokemon.name.toLowerCase().includes(lower)) {
    return 'Name';
  }

  // Check type match
  if (pokemon.types.some((type) => type.toLowerCase().includes(lower))) {
    const type = pokemon.types.find((type) => type.toLowerCase().includes(lower));
    return type ? capitalizeName(type) : 'Type';
  }

  // Check ability match
  if (
    pokemon.abilities.some(
      (abilityData) =>
        abilityData.ability.name.toLowerCase().includes(lower) ||
        abilityData.ability.names.some((nameData) => nameData.name.toLowerCase().includes(lower)),
    )
  ) {
    const ability = pokemon.abilities.find((abilityData) =>
      abilityData.ability.names[0].name.toLowerCase().includes(lower),
    );
    return ability ? ability.ability.names[0].name : 'Ability';
  }

  return null;
};

export default function PokemonTableSearchResultRow({
  pokemon,
  onClick,
  searchQuery = '',
}: PokemonTableSearchResultRowProps) {
  const matchBadge = getMatchBadge(pokemon, searchQuery);

  return (
    <Link
      href={`/pokemon/${pokemon.pokemonId}`}
      className="flex items-center p-3 hover:bg-hover border-b border-border last:border-b-0 cursor-pointer transition-colors duration-300 block"
      onClick={onClick}
    >
      <Sprite
        src={pokemon.sprites?.frontDefault || pokemon.sprites?.frontShiny || ''}
        alt={pokemon.name}
        variant="xs"
      />
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span>
            <span className="font-medium text-muted mr-2">
              #{pokemon.speciesId.toString().padStart(3, '0')}
            </span>
            <span className="text-primary font-medium">{capitalizeName(pokemon.name)}</span>
          </span>
          {matchBadge && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-brand/10 text-brand border border-brand/20">
              {matchBadge}
            </span>
          )}
        </div>
        <div className="flex gap-1 mt-1">
          <TypeBadgesDisplay types={pokemon.types} />
        </div>
      </div>
    </Link>
  );
}

// Module-level variable to store current search query
let currentSearchQuery = '';

// Filter function
export const pokemonTableFilter = (pokemon: PokemonColumns, query: string): boolean => {
  currentSearchQuery = query; // Store for render function

  if (!query.trim()) return false;

  const lower = query.toLowerCase();

  // Name match
  if (pokemon.name.toLowerCase().includes(lower)) return true;

  // Species ID match
  if (pokemon.speciesId.toString().includes(query.trim())) return true;

  // Type match
  if (pokemon.types.some((type) => type.toLowerCase().includes(lower))) return true;

  // Ability match
  if (
    pokemon.abilities.some(
      (abilityData) =>
        abilityData.ability.name.toLowerCase().includes(lower) ||
        abilityData.ability.names.some((nameData) => nameData.name.toLowerCase().includes(lower)),
    )
  )
    return true;

  return false;
};

// Render function
export const renderPokemonTableResult = (pokemon: PokemonColumns, onResultClick: () => void) => (
  <PokemonTableSearchResultRow
    pokemon={pokemon}
    onClick={onResultClick}
    searchQuery={currentSearchQuery}
  />
);
