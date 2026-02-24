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
    | null
    | undefined;
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

  // Track dataset sizes for change detection
  const datasetSizeRef = useRef<number>(0);
  const regionalDatasetSizeRef = useRef<number>(0);

  // Direct state for pokemonDataArray to ensure proper reactivity
  const [pokemonDataArray, setPokemonDataArray] = useState<PokemonListData[]>([]);

  // Boolean state to track if regional pokedex cache has been populated
  const [regionalPokedexCacheReady, setRegionalPokedexCacheReady] = useState(false);

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

  // Smart cache update logic for regional pokedexes
  useEffect(() => {
    if (!regionalPokedexData) return;

    // Calculate total size of the Map structure
    const totalPokedexes = Array.from(regionalPokedexData.values()).reduce(
      (total, pokedexArray) => total + pokedexArray.length,
      0,
    );

    const cacheIsEmpty = regionalPokedexesCacheRef.current.size === 0;
    const datasetSizeChanged = regionalDatasetSizeRef.current !== totalPokedexes;

    if (cacheIsEmpty || datasetSizeChanged) {
      // Clear and repopulate cache
      regionalPokedexesCacheRef.current.clear();

      regionalPokedexData.forEach((pokedexArray, generationId) => {
        regionalPokedexesCacheRef.current.set(generationId, pokedexArray);
      });

      // Update tracking
      regionalDatasetSizeRef.current = totalPokedexes;
      setRegionalPokedexCacheReady(true);

      console.log(
        `Regional Pokedex cache updated: ${cacheIsEmpty ? 'empty cache' : 'size changed'} - ${totalPokedexes} total pokedexes across ${regionalPokedexData.size} generations`,
      );
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
    regionalDatasetSizeRef.current = 0;
    setPokemonDataArray([]);
    setRegionalPokedexCacheReady(false);
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
      const allPokemonIds: number[] = [];

      for (let genId = 1; genId <= generationId; genId++) {
        const pokemonIdsInGeneration = generationPokemonMap.get(genId);
        if (pokemonIdsInGeneration) {
          allPokemonIds.push(...pokemonIdsInGeneration);
        }
      }

      return getCachedPokemon(allPokemonIds);
    },
    [generationPokemonMap, getCachedPokemon],
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
      | null
      | undefined => {
      // Return undefined if cache is not ready (distinguishes from null = no data)
      if (!regionalPokedexCacheReady) return undefined;
      return regionalPokedexesCacheRef.current.get(generationId) ?? null;
    },
    [regionalPokedexCacheReady],
  );

  const clearRegionalPokedexesCache = useCallback(() => {
    regionalPokedexesCacheRef.current.clear();
    setRegionalPokedexCacheReady(false);
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
