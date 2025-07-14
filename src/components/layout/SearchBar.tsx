'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { getTypeColor } from '~/utils/pokemon';
import { capitalizeName } from '~/utils/text';
import { trpc } from '~/utils/trpc';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const searchResults = trpc.pokemon.search.useQuery(
    {
      query: searchQuery,
      limit: 10,
    },
    {
      enabled: searchQuery.length > 0,
      staleTime: 1000 * 60 * 5,
    },
  );

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Search Pokémon by name or number..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          className="w-full px-4 py-3 pl-10 border-2 border-border rounded-lg focus:outline-none focus:border-brand bg-surface text-primary transition-colors duration-300 placeholder:text-subtle"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg
            className="w-5 h-5 text-subtle transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {searchResults.data && (
        <div className="absolute top-full mt-1 w-full bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50 transition-colors duration-300">
          {searchResults.data.pokemon.map((pokemon) => (
            <Link
              key={pokemon.id}
              href={`/pokemon/${pokemon.id}`}
              className="flex items-center p-3 hover:bg-interactive-hover border-b border-border last:border-b-0 cursor-pointer transition-colors duration-200 block"
              onClick={() => setSearchQuery('')} // Clear search when clicking a result
            >
              <img
                src={pokemon.sprites?.frontDefault || ''}
                alt={pokemon.name}
                className="w-12 h-12 object-contain"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-primary transition-colors duration-300">
                    #{pokemon.pokemonSpecies.id.toString().padStart(3, '0')}
                  </span>
                  <span className="text-muted transition-colors duration-300">
                    {capitalizeName(pokemon.name)}
                  </span>
                </div>
                <div className="flex gap-1 mt-1">
                  {pokemon.types.map((pokemonType) => (
                    <span
                      key={pokemonType.type.name}
                      className="px-2 py-0.5 text-xs rounded text-white font-medium"
                      style={{
                        backgroundColor: getTypeColor(pokemonType.type.name),
                      }}
                    >
                      {pokemonType.type.name.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
