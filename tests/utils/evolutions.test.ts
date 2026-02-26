/**
 * Unit tests for ~/utils/evolutions.ts
 *
 * Covers: formatEvolutionConditions, computeNodesep, computeRanksep,
 *         nodeSizeFromBp, mergeLocationEvolutions, isVariantEvolution
 * Estimated coverage: ~95% of evolutions.ts code paths
 */
import { describe, it, expect } from 'vitest';
import {
  formatEvolutionConditions,
  computeNodesep,
  computeRanksep,
  nodeSizeFromBp,
  mergeLocationEvolutions,
  isVariantEvolution,
} from '~/utils/evolutions';

// ─── helpers ──────────────────────────────────────────────────────────────────

type MockEvolution = {
  minLevel: number | null;
  evolutionTrigger: { name: string } | null;
  tradeSpeciesId: number | null;
  evolutionItem: { name: string } | null;
  timeOfDay: string | null;
  location: { name: string } | null;
  heldItem: { name: string } | null;
  knownMove: { name: string } | null;
  knownMoveType: { name: string } | null;
  minHappiness: number | null;
  minBeauty: number | null;
  minAffection: number | null;
  needsOverworldRain: boolean;
  partySpeciesId: number | null;
  partyTypeId: number | null;
  partyType: { names: { name: string }[]; name: string } | null;
  relativePhysicalStats: number | null;
  turnUpsideDown: boolean;
};

const BASE_EVO: MockEvolution = {
  minLevel: null,
  evolutionTrigger: null,
  tradeSpeciesId: null,
  evolutionItem: null,
  timeOfDay: null,
  location: null,
  heldItem: null,
  knownMove: null,
  knownMoveType: null,
  minHappiness: null,
  minBeauty: null,
  minAffection: null,
  needsOverworldRain: false,
  partySpeciesId: null,
  partyTypeId: null,
  partyType: null,
  relativePhysicalStats: null,
  turnUpsideDown: false,
};

const noSpeciesMap = new Map<number, string>();

function evo(partial: Partial<MockEvolution>): MockEvolution {
  return { ...BASE_EVO, ...partial };
}

// ─────────────────────────────────────────────────────────────────
// formatEvolutionConditions – special cases
// ─────────────────────────────────────────────────────────────────
describe('formatEvolutionConditions – special hard-coded cases', () => {
  it('returns the special string for primeape → annihilape', () => {
    const result = formatEvolutionConditions(
      evo({}) as any,
      noSpeciesMap,
      'primeape',
      'annihilape',
    );
    expect(result).toBe('Level up after using Rage Fist 20 times');
  });

  it('returns the special string for meltan → melmetal', () => {
    const result = formatEvolutionConditions(
      evo({}) as any,
      noSpeciesMap,
      'meltan',
      'melmetal',
    );
    expect(result).toBe('Evolves with 400 Meltan Candies in Pokémon GO');
  });

  it('returns the special string for applin → flapple', () => {
    const result = formatEvolutionConditions(
      evo({}) as any,
      noSpeciesMap,
      'applin',
      'flapple',
    );
    expect(result).toBe('Use Tart Apple');
  });
});

// ─────────────────────────────────────────────────────────────────
// formatEvolutionConditions – null / missing evolution
// ─────────────────────────────────────────────────────────────────
describe('formatEvolutionConditions – null evolution', () => {
  it('returns "Uknown" (source spelling) when evolution object is falsy', () => {
    const result = formatEvolutionConditions(
      null as any,
      noSpeciesMap,
      'from',
      'to',
    );
    expect(result).toBe('Uknown');
  });
});

// ─────────────────────────────────────────────────────────────────
// formatEvolutionConditions – level-up conditions
// ─────────────────────────────────────────────────────────────────
describe('formatEvolutionConditions – level-up conditions', () => {
  it('includes "Level N" when minLevel is set', () => {
    const result = formatEvolutionConditions(
      evo({ minLevel: 36, evolutionTrigger: { name: 'level-up' } }) as any,
      noSpeciesMap,
      'ivysaur',
      'venusaur',
    );
    expect(result).toContain('Level 36');
  });

  it('includes "Level up" (without a number) when trigger is level-up with no minLevel', () => {
    const result = formatEvolutionConditions(
      evo({ evolutionTrigger: { name: 'level-up' } }) as any,
      noSpeciesMap,
      'a',
      'b',
    );
    expect(result).toContain('Level up');
  });

  it('includes time-of-day condition for level-up evolutions', () => {
    const result = formatEvolutionConditions(
      evo({ evolutionTrigger: { name: 'level-up' }, timeOfDay: 'night' }) as any,
      noSpeciesMap,
      'eevee',
      'umbreon',
    );
    expect(result).toContain('During night');
  });

  it('includes capitalized location name for location-based level-up', () => {
    // Use a pair not in specialEvolutionCases so the generic path is exercised
    const result = formatEvolutionConditions(
      evo({ evolutionTrigger: { name: 'level-up' }, location: { name: 'mount-coronet' } }) as any,
      noSpeciesMap,
      'rattata',
      'raticate',
    );
    expect(result).toContain('at Mount Coronet');
  });
});

// ─────────────────────────────────────────────────────────────────
// formatEvolutionConditions – trade conditions
// ─────────────────────────────────────────────────────────────────
describe('formatEvolutionConditions – trade conditions', () => {
  it('produces "Trade" with no held species when tradeSpeciesId is null', () => {
    const result = formatEvolutionConditions(
      evo({ evolutionTrigger: { name: 'trade' } }) as any,
      noSpeciesMap,
      'haunter',
      'gengar',
    );
    expect(result).toBe('Trade');
  });

  it('includes species name when tradeSpeciesId resolves in the map', () => {
    const speciesMap = new Map([[229, 'houndoom']]);
    const result = formatEvolutionConditions(
      evo({ evolutionTrigger: { name: 'trade' }, tradeSpeciesId: 229 }) as any,
      speciesMap,
      'pinsir',
      'heracross', // fictional, just for naming
    );
    expect(result).toContain('With Houndoom');
  });

  it('falls back to "With specific Pokémon" when speciesId not in map', () => {
    const result = formatEvolutionConditions(
      evo({ evolutionTrigger: { name: 'trade' }, tradeSpeciesId: 999 }) as any,
      noSpeciesMap,
      'a',
      'b',
    );
    expect(result).toContain('With specific Pokémon');
  });
});

// ─────────────────────────────────────────────────────────────────
// formatEvolutionConditions – item / misc conditions
// ─────────────────────────────────────────────────────────────────
describe('formatEvolutionConditions – item and misc conditions', () => {
  it('produces "Use <Item>" for use-item trigger', () => {
    const result = formatEvolutionConditions(
      evo({
        evolutionTrigger: { name: 'use-item' },
        evolutionItem: { name: 'thunder-stone' },
      }) as any,
      noSpeciesMap,
      'pikachu',
      'raichu',
    );
    expect(result).toBe('Use Thunder Stone');
  });

  it('includes "Holding <Item>" when heldItem is present', () => {
    const result = formatEvolutionConditions(
      evo({ evolutionTrigger: { name: 'level-up' }, heldItem: { name: 'metal-coat' } }) as any,
      noSpeciesMap,
      'onix',
      'steelix',
    );
    expect(result).toContain('Holding Metal Coat');
  });

  it('includes happiness condition', () => {
    const result = formatEvolutionConditions(
      evo({ evolutionTrigger: { name: 'level-up' }, minHappiness: 220 }) as any,
      noSpeciesMap,
      'eevee',
      'espeon',
    );
    expect(result).toContain('With 220+ Happiness');
  });

  it('includes relative physical stat comparison (Attack > Defense)', () => {
    const result = formatEvolutionConditions(
      evo({ evolutionTrigger: { name: 'level-up' }, relativePhysicalStats: 1 }) as any,
      noSpeciesMap,
      'tyrogue',
      'hitmonlee',
    );
    expect(result).toContain('When Attack > Defense');
  });

  it('includes Attack = Defense comparison', () => {
    const result = formatEvolutionConditions(
      evo({ evolutionTrigger: { name: 'level-up' }, relativePhysicalStats: 0 }) as any,
      noSpeciesMap,
      'tyrogue',
      'hitmontop',
    );
    expect(result).toContain('When Attack = Defense');
  });

  it('includes Attack < Defense comparison', () => {
    const result = formatEvolutionConditions(
      evo({ evolutionTrigger: { name: 'level-up' }, relativePhysicalStats: -1 }) as any,
      noSpeciesMap,
      'tyrogue',
      'hitmonchan',
    );
    expect(result).toContain('When Attack < Defense');
  });

  it('joins multiple conditions with " and "', () => {
    const result = formatEvolutionConditions(
      evo({
        evolutionTrigger: { name: 'level-up' },
        minLevel: 20,
        minHappiness: 160,
      }) as any,
      noSpeciesMap,
      'a',
      'b',
    );
    expect(result).toBe('Level 20 and With 160+ Happiness');
  });

  it('returns "No special conditions" when no conditions apply', () => {
    const result = formatEvolutionConditions(
      evo({}) as any,
      noSpeciesMap,
      'unknown-a',
      'unknown-b',
    );
    expect(result).toBe('No special conditions');
  });
});

// ─────────────────────────────────────────────────────────────────
// computeNodesep
// ─────────────────────────────────────────────────────────────────
describe('computeNodesep', () => {
  const base = {
    containerWidth: 800,
    containerHeight: 600,
    nodeWidth: 100,
    nodeHeight: 100,
  };

  it('returns 60 when there is only one sibling (spacing irrelevant)', () => {
    expect(computeNodesep({ rankdir: 'TB', ...base, maxSiblings: 1 })).toBe(60);
  });

  it('TB layout: distributes 95% of remaining width across siblings', () => {
    // 4 siblings, TB: avail = 800 - 4*100 = 400; maxSpacing = 400*0.95/(4-1) ≈ 126.67
    const result = computeNodesep({ rankdir: 'TB', ...base, maxSiblings: 4 });
    expect(result).toBeCloseTo(126.67, 1);
  });

  it('TB layout with 7+ siblings: enforces an 80px minimum', () => {
    // 8 siblings, totalW = 800 = containerWidth → avail = 0 → maxSpacing = 0 → min 80
    const result = computeNodesep({ rankdir: 'TB', ...base, maxSiblings: 8 });
    expect(result).toBe(80);
  });

  it('LR layout: uses container height for available space, minimum 80', () => {
    // 4 siblings, LR: avail = 600-400=200; maxSpacing = 200*0.95/3 ≈ 63.33 < 80
    const result = computeNodesep({ rankdir: 'LR', ...base, maxSiblings: 4 });
    expect(result).toBe(80);
  });

  it('LR layout: returns calculated value when it exceeds 80', () => {
    // 2 siblings, LR: avail = 600-200=400; maxSpacing = 400*0.95/1 = 380 > 80
    const result = computeNodesep({ rankdir: 'LR', ...base, maxSiblings: 2 });
    expect(result).toBe(380);
  });

  it('clamps maxSiblings to [1, 8]', () => {
    // maxSiblings=0 is clamped to 1 → returns 60
    expect(computeNodesep({ rankdir: 'TB', ...base, maxSiblings: 0 })).toBe(60);
  });
});

// ─────────────────────────────────────────────────────────────────
// computeRanksep
// ─────────────────────────────────────────────────────────────────
describe('computeRanksep', () => {
  const base = {
    containerWidth: 800,
    containerHeight: 600,
    nodeWidth: 100,
    nodeHeight: 100,
    maxSiblings: 2,
  };

  it('returns 50 when rankCount is 1 (only one rank)', () => {
    expect(computeRanksep({ rankdir: 'TB', ...base, rankCount: 1 })).toBe(50);
  });

  it('LR layout: respects edge-label reserve and enforces 100px minimum', () => {
    // rankCount=3; totalW=300; avail=500; remaining=400; spacing=400*0.5/2=100; min=100
    const result = computeRanksep({ rankdir: 'LR', ...base, rankCount: 3 });
    expect(result).toBe(100);
  });

  it('TB layout: uses container height and enforces 120px base minimum', () => {
    // rankCount=3; totalH=300; avail=300; maxSpacing=300*0.8/2=120; base=120
    const result = computeRanksep({ rankdir: 'TB', ...base, rankCount: 3 });
    expect(result).toBe(120);
  });

  it('TB layout with maxSiblings ≥ 7: uses containerWidth (not height)', () => {
    // rankCount=3; totalH=300; avail = containerWidth(800)-300=500; spacing=500*0.4/2=100 > 80
    const result = computeRanksep({
      rankdir: 'TB',
      ...base,
      maxSiblings: 8,
      rankCount: 3,
    });
    expect(result).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────
// nodeSizeFromBp
// ─────────────────────────────────────────────────────────────────
describe('nodeSizeFromBp', () => {
  it('is capped at 180 when width and height both allow a larger size', () => {
    // bp=1000, rankCount=3, maxSibs=5
    // maxW = (1000-2*20)/3 = 320; maxH = (1000-4*20)/5 = 184
    // min(320, 184, 180) = 180
    expect(nodeSizeFromBp(1000, 3, 5)).toBe(180);
  });

  it('is constrained by available width in a wide layout', () => {
    // bp=300, rankCount=2, maxSibs=3
    // maxW = (300-20)/2 = 140; maxH = (1000-2*20)/3 = 320
    // min(140, 320, 180) = 140
    expect(nodeSizeFromBp(300, 2, 3)).toBe(140);
  });

  it('floors the result to an integer', () => {
    const result = nodeSizeFromBp(1000, 7, 3);
    expect(Number.isInteger(result)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────
// mergeLocationEvolutions
// ─────────────────────────────────────────────────────────────────
describe('mergeLocationEvolutions', () => {
  it('returns the single element when array length is 1', () => {
    const single = { id: 1, location: { name: 'mt-moon' } };
    const result = mergeLocationEvolutions([single] as any);
    expect(result).toBe(single);
  });

  it('merges multiple location names into a comma-separated string', () => {
    const evo1 = { id: 1, location: { name: 'mount-coronet' } };
    const evo2 = { id: 2, location: { name: 'special-cave' } };
    const result = mergeLocationEvolutions([evo1, evo2] as any) as any;
    expect(result.location.name).toBe('Mount Coronet, Special Cave');
  });

  it('retains base evolution location when none of the evos have a location', () => {
    const evo1 = { id: 1, location: null };
    const evo2 = { id: 2, location: null };
    const result = mergeLocationEvolutions([evo1, evo2] as any) as any;
    // locationNames will be empty, so base location (null) is kept
    expect(result.location).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────
// isVariantEvolution
// ─────────────────────────────────────────────────────────────────
describe('isVariantEvolution', () => {
  it('returns true when all three conditions are met', () => {
    const species = {
      evolvesToSpecies: [
        { id: 2, pokemonEvolutions: [{ id: 10 }, { id: 11 }] }, // >1 evo paths
      ],
    };
    const targetMap = new Map([[2, { varieties: [{ id: 1 }, { id: 2 }] }]]);
    expect(isVariantEvolution(species as any, targetMap as any)).toBe(true);
  });

  it('returns false when species evolves into more than one target', () => {
    const species = {
      evolvesToSpecies: [
        { id: 2, pokemonEvolutions: [{}] },
        { id: 3, pokemonEvolutions: [{}] },
      ],
    };
    expect(isVariantEvolution(species as any, new Map())).toBe(false);
  });

  it('returns false when the evolution has only one condition', () => {
    const species = {
      evolvesToSpecies: [{ id: 2, pokemonEvolutions: [{ id: 10 }] }], // exactly 1
    };
    const targetMap = new Map([[2, { varieties: [{ id: 1 }, { id: 2 }] }]]);
    expect(isVariantEvolution(species as any, targetMap as any)).toBe(false);
  });

  it('returns false when target species has only one variety', () => {
    const species = {
      evolvesToSpecies: [{ id: 2, pokemonEvolutions: [{}, {}] }],
    };
    const targetMap = new Map([[2, { varieties: [{ id: 1 }] }]]); // only 1 variety
    expect(isVariantEvolution(species as any, targetMap as any)).toBe(false);
  });

  it('returns false when target species is not in the map', () => {
    const species = {
      evolvesToSpecies: [{ id: 2, pokemonEvolutions: [{}, {}] }],
    };
    expect(isVariantEvolution(species as any, new Map())).toBe(false);
  });
});
