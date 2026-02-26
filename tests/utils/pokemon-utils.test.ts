/**
 * Unit tests for ~/utils/pokemon.ts and additional helpers in ~/utils/pokemon-stats.ts
 *
 * Covers:
 *   pokemon.ts  – getMethodDisplayName, sortMovesByMethod, getDamageClassIcon,
 *                 formatGenderRate, starterIds, significantPokemonIds
 *   pokemon-stats.ts – getStatAbbr, getStatName, convertStatsArrayToValues,
 *                      calculateStatRanges, formatStatRange, getCompetitiveStatRanges
 *
 * Estimated coverage: ~90% of the above code paths
 */
import { describe, it, expect } from 'vitest';
import {
  getMethodDisplayName,
  sortMovesByMethod,
  getDamageClassIcon,
  formatGenderRate,
  starterIds,
  significantPokemonIds,
} from '~/utils/pokemon';
import {
  getStatAbbr,
  getStatName,
  convertStatsArrayToValues,
  calculateStatRanges,
  formatStatRange,
  getCompetitiveStatRanges,
} from '~/utils/pokemon-stats';

// ─────────────────────────────────────────────────────────────────
// getMethodDisplayName
// ─────────────────────────────────────────────────────────────────
describe('getMethodDisplayName', () => {
  // The second argument (_moves) is unused in the function; pass null for simplicity.
  const noMoves = null as any;

  it.each([
    ['level-up', 'Level Up'],
    ['machine', 'TM/HM'],
    ['egg', 'Egg Moves'],
    ['tutor', 'Move Tutor'],
    ['transfer', 'Transfer Only'],
  ])('known method "%s" → "%s"', (method, expected) => {
    expect(getMethodDisplayName(method, noMoves)).toBe(expected);
  });

  it('converts unknown hyphenated methods to spaced form', () => {
    expect(getMethodDisplayName('zygarde-cube', noMoves)).toBe('zygarde cube');
    expect(getMethodDisplayName('xd-shadow', noMoves)).toBe('xd shadow');
  });

  it('returns the method unchanged when it has no hyphens and is unknown', () => {
    expect(getMethodDisplayName('custom', noMoves)).toBe('custom');
  });
});

// ─────────────────────────────────────────────────────────────────
// sortMovesByMethod
// ─────────────────────────────────────────────────────────────────
describe('sortMovesByMethod', () => {
  it('places level-up before machine before egg', () => {
    const map = { egg: {}, machine: {}, 'level-up': {} } as any;
    expect(sortMovesByMethod(map)).toEqual(['level-up', 'machine', 'egg']);
  });

  it('places known methods before unknown methods', () => {
    const map = { 'custom-method': {}, 'level-up': {} } as any;
    const result = sortMovesByMethod(map);
    expect(result.indexOf('level-up')).toBeLessThan(result.indexOf('custom-method'));
  });

  it('sorts multiple unknown methods alphabetically', () => {
    const map = { zzz: {}, aaa: {}, mmm: {} } as any;
    expect(sortMovesByMethod(map)).toEqual(['aaa', 'mmm', 'zzz']);
  });

  it('returns an empty array for an empty map', () => {
    expect(sortMovesByMethod({} as any)).toEqual([]);
  });

  it('handles a single known method', () => {
    expect(sortMovesByMethod({ tutor: {} } as any)).toEqual(['tutor']);
  });
});

// ─────────────────────────────────────────────────────────────────
// getDamageClassIcon
// ─────────────────────────────────────────────────────────────────
describe('getDamageClassIcon', () => {
  it('returns 💥 for physical moves', () => {
    expect(getDamageClassIcon('physical')).toBe('💥');
  });

  it('returns 🌀 for special moves', () => {
    expect(getDamageClassIcon('special')).toBe('🌀');
  });

  it('returns ⚡ for status moves', () => {
    expect(getDamageClassIcon('status')).toBe('⚡');
  });

  it('returns ❓ for unknown damage class', () => {
    expect(getDamageClassIcon('unknown')).toBe('❓');
    expect(getDamageClassIcon('')).toBe('❓');
  });
});

// ─────────────────────────────────────────────────────────────────
// formatGenderRate
// ─────────────────────────────────────────────────────────────────
describe('formatGenderRate', () => {
  it('returns the genderless tuple for rate -1', () => {
    const result = formatGenderRate(-1);
    expect(result[0]).toBeNull();
    expect(result[1]).toBeNull();
    expect(result[2]).toMatchObject({ value: 'Genderless' });
  });

  it('returns 100% male / 0.0% female for rate 0', () => {
    const result = formatGenderRate(0) as any;
    expect(result[0].value).toBe('100%');
    expect(result[1].value).toBe('0.0%');
    expect(result[2]).toBeNull();
  });

  it('returns 0.0% male / 100% female for rate 8', () => {
    const result = formatGenderRate(8) as any;
    expect(result[0].value).toBe('0.0%');
    expect(result[1].value).toBe('100%');
  });

  it('returns equal 50% split for rate 4', () => {
    const result = formatGenderRate(4) as any;
    expect(result[0].value).toBe('50.0%');
    expect(result[1].value).toBe('50.0%');
  });

  it('returns correct values for rate 1 (87.5% male / 12.5% female)', () => {
    const result = formatGenderRate(1) as any;
    expect(result[0].value).toBe('87.5%');
    expect(result[1].value).toBe('12.5%');
  });

  it('attaches correct gender symbols', () => {
    const result = formatGenderRate(4) as any;
    expect(result[0].symbol).toBe('♂');
    expect(result[1].symbol).toBe('♀');
  });
});

// ─────────────────────────────────────────────────────────────────
// starterIds constant
// ─────────────────────────────────────────────────────────────────
describe('starterIds', () => {
  it('defines starters for all 9 generations', () => {
    expect(Object.keys(starterIds)).toHaveLength(9);
  });

  it('Gen 1 starters are Bulbasaur (1), Charmander (4), Squirtle (7)', () => {
    expect(starterIds[1]).toEqual([1, 4, 7]);
  });

  it('Gen 9 starters are Sprigatito (906), Fuecoco (909), Quaxly (912)', () => {
    expect(starterIds[9]).toEqual([906, 909, 912]);
  });

  it('every generation has exactly 3 starters', () => {
    for (const gen of Object.values(starterIds)) {
      expect(gen).toHaveLength(3);
    }
  });
});

// ─────────────────────────────────────────────────────────────────
// significantPokemonIds constant
// ─────────────────────────────────────────────────────────────────
describe('significantPokemonIds', () => {
  it('contains at least 10 Pokemon per generation (90 total across 9 gens)', () => {
    expect(significantPokemonIds.length).toBeGreaterThanOrEqual(90);
  });

  it('includes Pikachu (25)', () => {
    expect(significantPokemonIds).toContain(25);
  });

  it('includes Mewtwo (150)', () => {
    expect(significantPokemonIds).toContain(150);
  });

  it('contains no duplicate IDs', () => {
    const unique = new Set(significantPokemonIds);
    expect(unique.size).toBe(significantPokemonIds.length);
  });

  it('contains only positive integers', () => {
    for (const id of significantPokemonIds) {
      expect(id).toBeGreaterThan(0);
      expect(Number.isInteger(id)).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────
// getStatAbbr
// ─────────────────────────────────────────────────────────────────
describe('getStatAbbr', () => {
  it.each([
    ['hp', 'HP'],
    ['attack', 'ATK'],
    ['defense', 'DEF'],
    ['special-attack', 'SP.ATK'],
    ['special-defense', 'SP.DEF'],
    ['speed', 'SPD'],
  ])('"%s" → "%s"', (key, abbr) => {
    expect(getStatAbbr(key)).toBe(abbr);
  });

  it('returns undefined for unrecognized stat names', () => {
    expect(getStatAbbr('unknown')).toBeUndefined();
    expect(getStatAbbr('specialAttack')).toBeUndefined(); // camelCase not a key
  });
});

// ─────────────────────────────────────────────────────────────────
// getStatName
// ─────────────────────────────────────────────────────────────────
describe('getStatName', () => {
  it.each([
    ['hp', 'HP'],
    ['attack', 'Attack'],
    ['defense', 'Defense'],
    ['special-attack', 'Sp. Atk'],
    ['special-defense', 'Sp. Def'],
    ['speed', 'Speed'],
  ])('"%s" → "%s"', (key, name) => {
    expect(getStatName(key)).toBe(name);
  });

  it('returns undefined for unrecognized stat names', () => {
    expect(getStatName('unknown')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────
// convertStatsArrayToValues
// ─────────────────────────────────────────────────────────────────
describe('convertStatsArrayToValues', () => {
  it('maps all six stat names to their base stat values', () => {
    const statsArray = [
      { stat: { name: 'hp' }, baseStat: 45 },
      { stat: { name: 'attack' }, baseStat: 49 },
      { stat: { name: 'defense' }, baseStat: 49 },
      { stat: { name: 'special-attack' }, baseStat: 65 },
      { stat: { name: 'special-defense' }, baseStat: 65 },
      { stat: { name: 'speed' }, baseStat: 45 },
    ];
    const result = convertStatsArrayToValues(statsArray as any);
    expect(result).toEqual({
      hp: 45,
      attack: 49,
      defense: 49,
      specialAttack: 65,
      specialDefense: 65,
      speed: 45,
    });
  });

  it('defaults to 0 for any stat not included in the array', () => {
    const result = convertStatsArrayToValues([] as any);
    expect(result).toEqual({
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    });
  });

  it('ignores unrecognised stat names without throwing', () => {
    const statsArray = [
      { stat: { name: 'not-a-stat' }, baseStat: 999 },
      { stat: { name: 'hp' }, baseStat: 100 },
    ];
    const result = convertStatsArrayToValues(statsArray as any);
    expect(result.hp).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────
// calculateStatRanges
// ─────────────────────────────────────────────────────────────────
describe('calculateStatRanges', () => {
  const baseStats = {
    hp: 100,
    attack: 100,
    defense: 100,
    specialAttack: 100,
    specialDefense: 100,
    speed: 100,
  };

  const ranges = calculateStatRanges(baseStats);

  it('produces ranges for all six stats', () => {
    expect(Object.keys(ranges)).toEqual(
      expect.arrayContaining(['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed']),
    );
  });

  it('HP neutral min/max matches the HP formula (level 100)', () => {
    // min = 2*100+0+0+110 = 310; max = 2*100+31+63+110 = 404
    expect(ranges.hp.level100.neutral.min).toBe(310);
    expect(ranges.hp.level100.neutral.max).toBe(404);
  });

  it('HP ignores nature – beneficial and neutral ranges are identical', () => {
    expect(ranges.hp.level100.beneficial).toEqual(ranges.hp.level100.neutral);
    expect(ranges.hp.level100.hindering).toEqual(ranges.hp.level100.neutral);
  });

  it('non-HP beneficial max > neutral max > hindering max at level 100', () => {
    const atk = ranges.attack.level100;
    expect(atk.beneficial.max).toBeGreaterThan(atk.neutral.max);
    expect(atk.neutral.max).toBeGreaterThan(atk.hindering.max);
  });

  it('level-50 max values are lower than level-100 max values', () => {
    const atk = ranges.attack;
    expect(atk.level50.neutral.max).toBeLessThan(atk.level100.neutral.max);
  });
});

// ─────────────────────────────────────────────────────────────────
// formatStatRange
// ─────────────────────────────────────────────────────────────────
describe('formatStatRange', () => {
  const baseStats = {
    hp: 100,
    attack: 100,
    defense: 100,
    specialAttack: 100,
    specialDefense: 100,
    speed: 100,
  };
  const ranges = calculateStatRanges(baseStats);

  it('formats as "min-max" string', () => {
    const result = formatStatRange(ranges, 'hp', 100, 'neutral');
    expect(result).toMatch(/^\d+-\d+$/);
  });

  it('HP level 100 neutral → "310-404"', () => {
    expect(formatStatRange(ranges, 'hp', 100, 'neutral')).toBe('310-404');
  });

  it('switches correctly between level 50 and level 100', () => {
    const at50 = formatStatRange(ranges, 'attack', 50, 'neutral');
    const at100 = formatStatRange(ranges, 'attack', 100, 'neutral');
    expect(at50).not.toBe(at100);
  });
});

// ─────────────────────────────────────────────────────────────────
// getCompetitiveStatRanges
// ─────────────────────────────────────────────────────────────────
describe('getCompetitiveStatRanges', () => {
  const baseStats = {
    hp: 100,
    attack: 100,
    defense: 100,
    specialAttack: 100,
    specialDefense: 100,
    speed: 100,
  };
  const competitive = getCompetitiveStatRanges(baseStats);

  it('HP has only a neutral range (no beneficial/hindering)', () => {
    const hpL50 = competitive.level50.hp;
    expect(hpL50).toHaveProperty('neutral');
    expect(hpL50).not.toHaveProperty('beneficial');
    expect(hpL50).not.toHaveProperty('hindering');
  });

  it('non-HP stats have beneficial, neutral, and hindering ranges', () => {
    const atkL100 = competitive.level100.attack;
    expect(atkL100).toHaveProperty('beneficial');
    expect(atkL100).toHaveProperty('neutral');
    expect(atkL100).toHaveProperty('hindering');
  });

  it('provides ranges for both level 50 and level 100', () => {
    expect(competitive).toHaveProperty('level50');
    expect(competitive).toHaveProperty('level100');
  });

  it('competitive neutral ranges match the full calculateStatRanges output', () => {
    const full = calculateStatRanges(baseStats);
    expect(competitive.level100.attack.neutral).toEqual(full.attack.level100.neutral);
  });
});
