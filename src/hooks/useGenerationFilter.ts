import { useState, useMemo } from 'react';
import type { PokemonMove, PokemonFlavorText, PokemonEncounter } from '~/server/routers/_app';

// Configuration interface
type GenerationFilterConfig<T> = {
  getGenerationId: (item: T) => number;
  getItemId: (item: T, index: number) => string | number;
  compareVersions: (a: T, b: T) => boolean;
};

// Return type
type GenerationFilterReturn<T> = {
  selectedGenerationId: number;
  setSelectedGenerationId: (id: number) => void;
  filteredItems: T[];
  availableGenerations: number[];
};

/**
 * Generic hook for filtering and deduplicating items by generation
 * @param items - Array of items to filter
 * @param config - Configuration object defining how to extract data from items
 * @param initialGenerationId - Optional initial generation ID, defaults to latest (0th index)
 */
export function useGenerationFilter<T>(
  items: T[],
  config: GenerationFilterConfig<T>,
  initialGenerationId?: number,
): GenerationFilterReturn<T> {
  // Default to latest generation (0th index) or provided initial
  const defaultGen = initialGenerationId ?? (items[0] ? config.getGenerationId(items[0]) : 1);
  const [selectedGenerationId, setSelectedGenerationId] = useState<number>(defaultGen);

  // Filter and deduplicate items by generation
  const filteredItems = useMemo(() => {
    // First filter by generation
    const generationItems = items.filter(
      (item) => config.getGenerationId(item) === selectedGenerationId,
    );

    // Deduplicate using provided configuration
    const itemMap = new Map();

    generationItems.forEach((item, index) => {
      const itemId = config.getItemId(item, index);
      const existing = itemMap.get(itemId);

      // If no existing item or current item should be preferred, use this one
      if (!existing || config.compareVersions(item, existing)) {
        itemMap.set(itemId, item);
      }
    });

    return Array.from(itemMap.values());
  }, [items, selectedGenerationId, config]);

  // Get available generations from all items
  const availableGenerations = useMemo(() => {
    const generations = new Set(items.map((item) => config.getGenerationId(item)));
    return Array.from(generations).sort((a, b) => a - b);
  }, [items, config]);

  return {
    selectedGenerationId,
    setSelectedGenerationId,
    filteredItems,
    availableGenerations,
  };
}

/**
 * Predefined configurations for common use cases
 */

// Configuration for filtering Pokemon moves
export const pokemonMovesConfig: GenerationFilterConfig<PokemonMove> = {
  getGenerationId: (move) => move.versionGroup.generation.id,
  getItemId: (move) => move.move.id,
  compareVersions: (a, b) => a.versionGroup.order > b.versionGroup.order,
};

// Configuration for filtering Pokemon flavor texts
export const pokemonFlavorTextsConfig: GenerationFilterConfig<PokemonFlavorText> = {
  getGenerationId: (flavorText) => flavorText.version.versionGroup.generation.id,
  getItemId: (_, index) => index,
  compareVersions: (a, b) => a.version.versionGroup.id > b.version.versionGroup.id,
};

// Configuration for filtering Pokemon encounters
// Note: Encounters are complex and may require additional filtering logic
export const pokemonEncountersConfig: GenerationFilterConfig<PokemonEncounter> = {
  getGenerationId: (encounter) => encounter.version.versionGroup.generation.id,
  getItemId: (encounter) => `${encounter.locationArea.id}-${encounter.encounterMethod.id}`,
  compareVersions: (a, b) => a.version.versionGroup.id > b.version.versionGroup.id,
};
