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
import type { RegionalPokedexes } from '~/server/routers/_app';

type GenerationWithPokemonIds = {
  id: number;
  name: string;
  pokemonIds: number[];
  speciesIds: number[];
};

interface PokedexCacheContextValue {
  // Pokemon
  pokemonDataArray: PokemonListData[];
  pokemonDataIsLoading: boolean;
  pokemonError: string | null;
  clearCache: () => void;
  getCachedPokemon: (ids: number[]) => PokemonListData[];
  getCacheSize: () => number;

  // Generations
  generationsData: GenerationWithPokemonIds[] | undefined;
  generationsLoading: boolean;
  generationsError: string | null;
  getPokemonByGeneration: (generationId: number) => PokemonListData[];
  getAllGenerations: () => GenerationWithPokemonIds[];
  getGenerationPokemonIds: (generationId: number) => number[];

  // Regional Pokedexes
  regionalPokedexIsLoading: boolean;
  regionalPokedexError: string | null;
  getRegionalPokedexesFromCache: (generationId: number) =>
    | {
        id: number;
        name: string;
        names: { name: string }[];
        descriptions: { description: string }[];
        pokemon: number[];
      }[]
    | null;
  clearRegionalPokedexesCache: () => void;
}

const PokedexCacheContext = createContext<PokedexCacheContextValue | undefined>(undefined);

interface PokedexCacheProviderProps {
  children: ReactNode;
}

export function PokedexCacheProvider({ children }: PokedexCacheProviderProps) {
  // Global cache for ALL Pokemon (persists across generation filter changes)
  const allPokemonCacheRef = useRef<Map<number, PokemonListData>>(new Map());

  // Cache for regional pokedexes data
  const regionalPokedexesCacheRef = useRef<RegionalPokedexes>(new Map());

  // Track dataset size for change detection
  const datasetSizeRef = useRef<number>(0);

  // Direct state for pokemonDataArray to ensure proper reactivity
  const [pokemonDataArray, setPokemonDataArray] = useState<PokemonListData[]>([]);

  // tRPC query for Pokemon and Species IDs by generation
  const {
    data: generationsData,
    isLoading: generationsLoading,
    error: generationsError,
  } = trpc.pokedex.generationPokemonIds.useQuery();

  // tRPC query for Pokemon data
  const {
    data: pokemonData,
    isLoading: pokemonDataIsLoading,
    error: pokemonError,
  } = trpc.pokedex.pokedexByGeneration.useQuery();

  // tRPC query for regional Pokédex data
  const {
    data: regionalPokedexData,
    isLoading: regionalPokedexIsLoading,
    error: regionalPokedexError,
  } = trpc.pokedex.regionalPokedexes.useQuery();

  // Smart cache update logic with change detection
  useEffect(() => {
    if (!pokemonData?.national?.pokemonListData) return;

    const pokemonListData = pokemonData.national.pokemonListData;
    const serverPokemonCount = pokemonListData.length;

    // Check if cache needs updating
    const cacheIsEmpty = allPokemonCacheRef.current.size === 0;
    const datasetSizeChanged = datasetSizeRef.current !== serverPokemonCount;

    if (cacheIsEmpty || datasetSizeChanged) {
      // Clear and repopulate cache
      allPokemonCacheRef.current.clear();

      pokemonListData.forEach((pokemon) => {
        allPokemonCacheRef.current.set(pokemon.pokemonId, pokemon);
      });

      // Update tracking
      datasetSizeRef.current = serverPokemonCount;
      setPokemonDataArray(Array.from(allPokemonCacheRef.current.values()));

      console.log(
        `Cache updated: ${cacheIsEmpty ? 'empty cache' : 'size changed'} - ${serverPokemonCount} Pokemon`,
      );
    }
  }, [pokemonData?.national?.pokemonListData]);

  useEffect(() => {
    if (regionalPokedexData) {
      regionalPokedexesCacheRef.current = regionalPokedexData;
    }
  }, [regionalPokedexData]);
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
    regionalPokedexesCacheRef.current.clear();
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

  // Regional Pokedexes cache management
  const getRegionalPokedexesFromCache = useCallback(
    (
      generationId: number,
    ):
      | {
          id: number;
          name: string;
          names: { name: string }[];
          descriptions: { description: string }[];
          pokemon: number[];
        }[]
      | null => regionalPokedexesCacheRef.current.get(generationId) ?? null,
    [],
  );

  const clearRegionalPokedexesCache = useCallback(() => {
    regionalPokedexesCacheRef.current.clear();
  }, []);

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

    // Regional Pokedexes properties
    regionalPokedexIsLoading,
    regionalPokedexError: regionalPokedexError?.message || null,
    getRegionalPokedexesFromCache,
    clearRegionalPokedexesCache,
  };

  return <PokedexCacheContext.Provider value={value}>{children}</PokedexCacheContext.Provider>;
}

export function usePokemonCache(): PokedexCacheContextValue {
  const context = useContext(PokedexCacheContext);
  if (context === undefined) {
    throw new Error('usePokemonCache must be used within a PokedexCacheProvider');
  }
  return context;
}
