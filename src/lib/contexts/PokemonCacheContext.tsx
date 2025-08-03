import React, { createContext, useContext, useRef, ReactNode, useCallback, useEffect } from 'react';
import { trpc } from '~/utils/trpc';
import { PokemonColumns } from '~/components/ui/tables';

interface PokemonCacheContextValue {
  searchArray: PokemonColumns[];
  isLoading: boolean;
  error: string | null;
  clearCache: () => void;
  getCachedPokemon: (ids: number[]) => PokemonColumns[];
  getCacheSize: () => number;
}

const PokemonCacheContext = createContext<PokemonCacheContextValue | undefined>(undefined);

interface PokemonCacheProviderProps {
  children: ReactNode;
}

export function PokemonCacheProvider({ children }: PokemonCacheProviderProps) {
  // Global cache for ALL Pokemon (persists across generation filter changes)
  const allPokemonCacheRef = useRef<Map<number, PokemonColumns>>(new Map());

  // tRPC query for Pokemon data
  const { data, isLoading, error } = trpc.pokemon.pokedexByGeneration.useQuery();

  // Transform and cache Pokemon data when query completes
  useEffect(() => {
    if (data?.national && allPokemonCacheRef.current.size === 0) {
      const allPokemon = data.national.pokemonSpecies.flatMap((species) =>
        species.pokemon.map((pokemon) => ({
          ...pokemon,
          speciesId: species.id,
        })),
      );

      const transformedPokemon: PokemonColumns[] = allPokemon.map((pkmn) => ({
        pokemonId: pkmn.id,
        speciesId: pkmn.speciesId,
        name: pkmn.name,
        sprites: {
          frontDefault: pkmn.sprites?.frontDefault,
          frontShiny: pkmn.sprites?.frontShiny,
        },
        types: pkmn.types.map((t) => t.type.name),
        abilities: pkmn.abilities,
        stats: pkmn.stats,
      }));

      // Add all Pokemon to cache at once
      transformedPokemon.forEach((pokemon) => {
        allPokemonCacheRef.current.set(pokemon.pokemonId, pokemon);
      });
    }
  }, [data?.national]);

  // Simple searchArray getter - populated after initial load
  const searchArray = Array.from(allPokemonCacheRef.current.values());

  const clearCache = useCallback(() => {
    allPokemonCacheRef.current.clear();
  }, []);

  const getCachedPokemon = useCallback((ids: number[]): PokemonColumns[] => {
    const result: PokemonColumns[] = [];
    for (const id of ids) {
      const pokemon = allPokemonCacheRef.current.get(id);
      if (pokemon) {
        result.push(pokemon);
      }
    }
    return result;
  }, []);

  const getCacheSize = useCallback((): number => {
    return allPokemonCacheRef.current.size;
  }, []);

  const value = {
    searchArray,
    isLoading,
    error: error?.message || null,
    clearCache,
    getCachedPokemon,
    getCacheSize,
  };

  return <PokemonCacheContext.Provider value={value}>{children}</PokemonCacheContext.Provider>;
}

export function usePokemonCache(): PokemonCacheContextValue {
  const context = useContext(PokemonCacheContext);
  if (context === undefined) {
    throw new Error('usePokemonCache must be used within a PokemonCacheProvider');
  }
  return context;
}
