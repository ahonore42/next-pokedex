'use client';

import React, { useState } from 'react';
import { capitalizeName, getTypeColor } from '~/lib/services/pokemon';
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
          className="w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg
            className="w-5 h-5 text-gray-400"
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
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden z-50">
          {searchResults.data.pokemon.map((pokemon) => (
            <div
              key={pokemon.id}
              className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
            >
              <img
                src={pokemon.sprites?.frontDefault || ''}
                alt={pokemon.name}
                className="w-12 h-12 object-contain"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    #{pokemon.pokemonSpecies.id.toString().padStart(3, '0')}
                  </span>
                  <span className="text-gray-700">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
