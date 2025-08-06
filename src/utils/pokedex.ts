import { GenerationPokedex, PokedexEntries } from '~/server/routers/_app';
import { romanToInteger } from './text';

// -------------------- Types -----------------------------

export type VersionGroup = {
  id: number;
  name: string;
  order: number;
  generation: Generation;
  versions: { name: string }[];
};

export type Generation = {
  id: number;
  name: string;
};

export type RegionInfo = {
  id: number;
  name: string;
  displayName: string;
};

// -------------------- Constants -------------------------

// Mapping of generation IDs to their primary regions
export const versionGroupIdRegionMap: Record<number, RegionInfo> = {
  1: { id: 1, name: 'kanto', displayName: 'Kanto' },
  2: { id: 2, name: 'johto', displayName: 'Johto' },
  3: { id: 3, name: 'hoenn', displayName: 'Hoenn' },
  4: { id: 4, name: 'sinnoh', displayName: 'Sinnoh' },
  5: { id: 5, name: 'unova', displayName: 'Unova' },
  6: { id: 6, name: 'kalos', displayName: 'Kalos' },
  7: { id: 7, name: 'alola', displayName: 'Alola' },
  8: { id: 8, name: 'galar', displayName: 'Galar' },
  9: { id: 9, name: 'paldea', displayName: 'Paldea' },
};

// -------------------- Functions -------------------------

export function parseGenerationToNumber(generationName: string): number | null {
  if (!generationName) return null;

  // Quick length check before string operations
  if (generationName.length < 12) return null; // "generation-i" minimum

  // Check if it starts with "generation-" (case insensitive)
  const prefix = generationName.slice(0, 11).toLowerCase();
  if (prefix !== 'generation-') return null;

  // Extract roman numeral part
  const romanNumeral = generationName.slice(11);
  if (!romanNumeral) return null;

  return romanToInteger(romanNumeral);
}

export function getRegionFromVersionGroup(versionGroup: VersionGroup): RegionInfo | null {
  if (!versionGroup) {
    return null;
  }

  const region = versionGroupIdRegionMap[versionGroup.generation.id];

  if (!region) {
    console.warn(`No region mapping found for generation: ${versionGroup.generation.id}`);
    return null;
  }

  return region;
}

export const getNationalDexForGeneration = (
  gens: GenerationPokedex[],
  targetGeneration: number,
): PokedexEntries => {
  const combinedPokemonSpecies = gens
    .filter((generation) => generation.id <= targetGeneration)
    .flatMap((generation) => generation.pokemonSpecies)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((species, index) => ({
      ...species,
      pokedexNumbers: [{ pokedexNumber: index + 1 }, ...species.pokedexNumbers.slice(1)],
    }));

  return {
    id: 1,
    name: `generations-1-to-${targetGeneration}`,
    pokemonSpecies: combinedPokemonSpecies,
  };
};

export function getGenerationDisplayName(genId: number): string {
  const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  return `Generation ${romanNumerals[genId] || genId}`;
}
