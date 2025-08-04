import React, {
  createContext,
  useContext,
  useRef,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { trpc } from '~/utils/trpc';
import { PokemonListData } from '../types/pokemon';

type GenerationWithPokemonIds = {
  id: number;
  name: string;
  pokemonIds: number[];
  speciesIds: number[];
};

interface PokemonCacheContextValue {
  pokemonDataArray: PokemonListData[];
  pokemonDataIsLoading: boolean;
  pokemonError: string | null;
  clearCache: () => void;
  getCachedPokemon: (ids: number[]) => PokemonListData[];
  getCacheSize: () => number;
  generationsData: GenerationWithPokemonIds[] | undefined;
  generationsLoading: boolean;
  generationsError: string | null;
  getPokemonByGeneration: (generationId: number) => PokemonListData[];
  getAllGenerations: () => GenerationWithPokemonIds[];
  getGenerationPokemonIds: (generationId: number) => number[];
}

const PokemonCacheContext = createContext<PokemonCacheContextValue | undefined>(undefined);

interface PokemonCacheProviderProps {
  children: ReactNode;
}

export function PokemonCacheProvider({ children }: PokemonCacheProviderProps) {
  // Global cache for ALL Pokemon (persists across generation filter changes)
  const allPokemonCacheRef = useRef<Map<number, PokemonListData>>(new Map());

  // Track dataset size for change detection
  const datasetSizeRef = useRef<number>(0);

  // Direct state for pokemonDataArray to ensure proper reactivity
  const [pokemonDataArray, setPokemonDataArray] = useState<PokemonListData[]>([]);

  // tRPC query for Pokemon and Species IDs by generation
  const {
    data: generationsData,
    isLoading: generationsLoading,
    error: generationsError,
  } = trpc.pokemon.generationPokemonIds.useQuery();

  // tRPC query for Pokemon data
  const {
    data: pokemonData,
    isLoading: pokemonDataIsLoading,
    error: pokemonError,
  } = trpc.pokemon.pokedexByGeneration.useQuery();

  // Smart cache update logic with change detection
  useEffect(() => {
    if (!pokemonData?.national) return;

    const performCacheUpdate = () => {
      const startTime = Date.now();

      try {
        // Calculate total Pokemon count from server data
        const serverPokemonCount = pokemonData.national.pokemonSpecies.reduce(
          (total, species) => total + species.pokemon.length,
          0,
        );

        // Check if cache is empty (always update)
        const cacheIsEmpty = allPokemonCacheRef.current.size === 0;

        // Check if dataset size changed (structure change detection)
        const datasetSizeChanged = datasetSizeRef.current !== serverPokemonCount;

        // Update cache if empty or dataset size changed
        if (cacheIsEmpty || datasetSizeChanged) {
          // Clear existing cache
          allPokemonCacheRef.current.clear();

          // Transform server data
          const allPokemon = pokemonData.national.pokemonSpecies.flatMap((species) =>
            species.pokemon.map((pokemon) => ({
              ...pokemon,
              speciesId: species.id,
            })),
          );

          const transformedPokemon: PokemonListData[] = allPokemon.map((pkmn) => ({
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

          // Populate cache
          transformedPokemon.forEach((pokemon) => {
            allPokemonCacheRef.current.set(pokemon.pokemonId, pokemon);
          });

          // Update size tracking
          datasetSizeRef.current = serverPokemonCount;

          // Update pokemonDataArray state to trigger re-render
          setPokemonDataArray(Array.from(allPokemonCacheRef.current.values()));

          console.log(
            `Cache updated: ${cacheIsEmpty ? 'empty cache' : 'size changed'} - ${serverPokemonCount} Pokemon`,
          );
        }

        const processingTime = Date.now() - startTime;
        if (processingTime > 100) {
          console.warn(`Cache processing took ${processingTime}ms`);
        }
      } catch (error) {
        const processingTime = Date.now() - startTime;

        // Fallback strategy: full refresh on error or timeout
        if (processingTime > 2000) {
          console.error('Cache update timeout, performing full refresh');
        } else {
          console.error('Cache update error:', error);
        }

        // Force full cache refresh as fallback
        allPokemonCacheRef.current.clear();
        datasetSizeRef.current = 0;
        setPokemonDataArray([]);

        // Retry with simpler logic
        try {
          const allPokemon = pokemonData.national.pokemonSpecies.flatMap((species) =>
            species.pokemon.map((pokemon) => ({
              ...pokemon,
              speciesId: species.id,
            })),
          );

          const transformedPokemon: PokemonListData[] = allPokemon.map((pkmn) => ({
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

          transformedPokemon.forEach((pokemon) => {
            allPokemonCacheRef.current.set(pokemon.pokemonId, pokemon);
          });

          datasetSizeRef.current = transformedPokemon.length;
          setPokemonDataArray(Array.from(allPokemonCacheRef.current.values()));
          console.log('Fallback cache refresh completed');
        } catch (fallbackError) {
          console.error('Fallback cache refresh failed:', fallbackError);
        }
      }
    };

    // Execute cache update with timeout protection
    const timeoutId = setTimeout(() => {
      console.error('Cache update exceeded 2000ms, triggering fallback');
      performCacheUpdate();
    }, 2000);

    performCacheUpdate();
    clearTimeout(timeoutId);
  }, [pokemonData?.national]);

  // Generation lookup map for efficient filtering
  const generationPokemonMap = useMemo(() => {
    if (!generationsData) return new Map<number, Set<number>>();

    const map = new Map<number, Set<number>>();
    generationsData.forEach((gen) => {
      map.set(gen.id, new Set(gen.pokemonIds));
    });
    return map;
  }, [generationsData]);

  const clearCache = useCallback(() => {
    allPokemonCacheRef.current.clear();
    datasetSizeRef.current = 0;
    setPokemonDataArray([]);
  }, []);

  const getCachedPokemon = useCallback((ids: number[]): PokemonListData[] => {
    const result: PokemonListData[] = [];
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

  const getPokemonByGeneration = useCallback(
    (generationId: number): PokemonListData[] => {
      const pokemonIdsInGeneration = generationPokemonMap.get(generationId);
      if (!pokemonIdsInGeneration) return [];

      const result: PokemonListData[] = [];
      for (const pokemonId of pokemonIdsInGeneration) {
        const pokemon = allPokemonCacheRef.current.get(pokemonId);
        if (pokemon) {
          result.push(pokemon);
        }
      }
      return result;
    },
    [generationPokemonMap],
  );

  const getAllGenerations = useCallback((): GenerationWithPokemonIds[] => {
    return generationsData || [];
  }, [generationsData]);

  const getGenerationPokemonIds = useCallback(
    (generationId: number): number[] => {
      return generationsData?.find((gen) => gen.id === generationId)?.pokemonIds || [];
    },
    [generationsData],
  );

  const value = {
    // Pokemon properties
    pokemonDataArray,
    pokemonDataIsLoading,
    pokemonError: pokemonError?.message || null,
    clearCache,
    getCachedPokemon,
    getCacheSize,

    // Generation properties
    generationsData,
    generationsLoading,
    generationsError: generationsError?.message || null,
    getPokemonByGeneration,
    getAllGenerations,
    getGenerationPokemonIds,
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
