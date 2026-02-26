/**
 * Unit tests for ~/utils/pokedex.ts
 *
 * Covers: parseGenerationToNumber, getRegionFromVersionGroup,
 *         getNationalDexForGeneration, getGenerationDisplayName
 * Estimated coverage: ~95% of pokedex.ts code paths
 */
import { describe, it, expect } from 'vitest';
import {
  parseGenerationToNumber,
  getRegionFromVersionGroup,
  getNationalDexForGeneration,
  getGenerationDisplayName,
} from '~/utils/pokedex';
import type { VersionGroup } from '~/utils/pokedex';

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Creates a minimal VersionGroup fixture pointing to the given generation. */
function makeVersionGroup(generationId: number): VersionGroup {
  return {
    id: generationId,
    name: `version-group-${generationId}`,
    order: generationId,
    generation: { id: generationId, name: `generation-${generationId}` },
    versions: [{ name: `version-${generationId}` }],
  };
}

/** Creates a minimal GenerationPokedex-shaped fixture. */
function makeGenPokedex(genId: number, species: { id: number; order: number }[]) {
  return {
    id: genId,
    name: `generation-${genId}`,
    pokemonSpecies: species.map((s) => ({
      id: s.id,
      name: `pokemon-${s.id}`,
      order: s.order,
      pokedexNumbers: [{ pokedexNumber: s.id }],
    })),
  };
}

// ─────────────────────────────────────────────────────────────────
// parseGenerationToNumber
// ─────────────────────────────────────────────────────────────────
describe('parseGenerationToNumber', () => {
  it('parses generation-i → 1', () => {
    expect(parseGenerationToNumber('generation-i')).toBe(1);
  });

  it('parses generation-ii → 2', () => {
    expect(parseGenerationToNumber('generation-ii')).toBe(2);
  });

  it('parses generation-iv (subtractive notation) → 4', () => {
    expect(parseGenerationToNumber('generation-iv')).toBe(4);
  });

  it('parses generation-viii → 8', () => {
    expect(parseGenerationToNumber('generation-viii')).toBe(8);
  });

  it('parses generation-ix → 9', () => {
    expect(parseGenerationToNumber('generation-ix')).toBe(9);
  });

  it('handles uppercase roman numeral suffix (prefix is lowercased)', () => {
    expect(parseGenerationToNumber('generation-VIII')).toBe(8);
    expect(parseGenerationToNumber('generation-IX')).toBe(9);
  });

  it('returns null for an empty string', () => {
    expect(parseGenerationToNumber('')).toBeNull();
  });

  it('returns null for string shorter than 12 characters', () => {
    // "generation-i" = 12 chars is the minimum valid input
    expect(parseGenerationToNumber('generation-')).toBeNull();
    expect(parseGenerationToNumber('gen-i')).toBeNull();
  });

  it('returns null for wrong prefix', () => {
    expect(parseGenerationToNumber('version-i')).toBeNull();
    expect(parseGenerationToNumber('region-i')).toBeNull();
  });

  it('returns null when roman numeral suffix is invalid', () => {
    expect(parseGenerationToNumber('generation-xyz')).toBeNull();
    expect(parseGenerationToNumber('generation-hello')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────
// getRegionFromVersionGroup
// ─────────────────────────────────────────────────────────────────
describe('getRegionFromVersionGroup', () => {
  it('returns Kanto for generation 1', () => {
    const region = getRegionFromVersionGroup(makeVersionGroup(1));
    expect(region).toMatchObject({ id: 1, name: 'kanto', displayName: 'Kanto' });
  });

  it('returns Johto for generation 2', () => {
    const region = getRegionFromVersionGroup(makeVersionGroup(2));
    expect(region).toMatchObject({ name: 'johto', displayName: 'Johto' });
  });

  it('returns Paldea for generation 9', () => {
    const region = getRegionFromVersionGroup(makeVersionGroup(9));
    expect(region).toMatchObject({ id: 9, name: 'paldea', displayName: 'Paldea' });
  });

  it('returns non-null for every defined generation (1–9)', () => {
    for (let gen = 1; gen <= 9; gen++) {
      expect(getRegionFromVersionGroup(makeVersionGroup(gen))).not.toBeNull();
    }
  });

  it('returns null for an unmapped generation id', () => {
    const region = getRegionFromVersionGroup(makeVersionGroup(99));
    expect(region).toBeNull();
  });

  it('returns null when given a falsy value (runtime guard)', () => {
    // The function has an explicit !versionGroup guard
    const region = getRegionFromVersionGroup(null as unknown as VersionGroup);
    expect(region).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────
// getNationalDexForGeneration
// ─────────────────────────────────────────────────────────────────
describe('getNationalDexForGeneration', () => {
  const gen1 = makeGenPokedex(1, [
    { id: 1, order: 1 },
    { id: 2, order: 2 },
  ]);
  const gen2 = makeGenPokedex(2, [{ id: 152, order: 152 }]);
  const gens = [gen1, gen2] as any;

  it('includes only species from generations ≤ targetGeneration', () => {
    const result = getNationalDexForGeneration(gens, 1);
    expect(result.pokemonSpecies).toHaveLength(2);
    expect(result.pokemonSpecies.every((s: any) => s.id <= 2)).toBe(true);
  });

  it('includes species from all generations up to and including the target', () => {
    const result = getNationalDexForGeneration(gens, 2);
    expect(result.pokemonSpecies).toHaveLength(3);
  });

  it('renumbers species sequentially starting from 1', () => {
    const result = getNationalDexForGeneration(gens, 2);
    result.pokemonSpecies.forEach((s: any, idx: number) => {
      expect(s.pokedexNumbers[0].pokedexNumber).toBe(idx + 1);
    });
  });

  it('returns empty species list when targetGeneration is 0', () => {
    const result = getNationalDexForGeneration(gens, 0);
    expect(result.pokemonSpecies).toHaveLength(0);
  });

  it('builds the pokedex name from the target generation number', () => {
    const result = getNationalDexForGeneration(gens, 2);
    expect(result.name).toBe('generations-1-to-2');
  });

  it('sorts species by the order field', () => {
    // gen2 species has order 152, gen1 species have orders 1 and 2
    const result = getNationalDexForGeneration(gens, 2);
    const orders = result.pokemonSpecies.map((s: any) => s.order);
    expect(orders).toEqual([...orders].sort((a, b) => (a || 0) - (b || 0)));
  });
});

// ─────────────────────────────────────────────────────────────────
// getGenerationDisplayName
// ─────────────────────────────────────────────────────────────────
describe('getGenerationDisplayName', () => {
  it.each([
    [1, 'Generation I'],
    [2, 'Generation II'],
    [3, 'Generation III'],
    [4, 'Generation IV'],
    [5, 'Generation V'],
    [6, 'Generation VI'],
    [7, 'Generation VII'],
    [8, 'Generation VIII'],
    [9, 'Generation IX'],
  ])('gen %i → %s', (genId, expected) => {
    expect(getGenerationDisplayName(genId)).toBe(expected);
  });

  it('falls back to the numeric id for out-of-range generation 10+', () => {
    expect(getGenerationDisplayName(10)).toBe('Generation 10');
  });

  it('falls back to the numeric id for generation 0 (empty roman)', () => {
    // romanNumerals[0] = '' which is falsy, so `'' || 0` = 0
    expect(getGenerationDisplayName(0)).toBe('Generation 0');
  });
});
