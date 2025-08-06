import { PokemonStats } from '~/server/routers/_app';

// -------------------- Types -----------------------------

export type StatValues = {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
};

//Parameters for calculating a Pokemon's stat value
export type StatCalculationParams = {
  baseStat: number; // Base stat value (0-255)
  iv: number; // Individual Value (0-31)
  ev: number; // Effort Value (0-252, total EVs across all stats cannot exceed 510)
  level: number; // Pokemon's level (1-100)
  natureModifier?: number; // Nature modifier (0.9, 1.0, or 1.1)
  isHpStat?: boolean; // Whether this is an HP stat calculation
};

export type MinMaxStats = {
  min: number;
  max: number;
};

export type StatRange = {
  beneficial: MinMaxStats;
  neutral: MinMaxStats;
  hindering: MinMaxStats;
};

// Min/max stats for all nature types at levels 50 and 100
export type StatRanges = {
  level50: StatRange;
  level100: StatRange;
};

export type NonHpStatRanges = Record<Exclude<keyof StatValues, 'hp'>, StatRange>;

export type ComprehensiveStatRanges = Record<keyof StatValues, StatRanges>;
export type CompetitiveRanges = {
  level50: {
    hp: { neutral: MinMaxStats };
  } & NonHpStatRanges;
  level100: {
    hp: { neutral: MinMaxStats };
  } & NonHpStatRanges;
};

// -------------------- Constants -------------------------

// Stat names for quick access
export const statNames: (keyof StatValues)[] = [
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
];
// Stat nature modifiers
export const natureModifiers = { beneficial: 1.1, neutral: 1.0, hindering: 0.9 };

// -------------------- Functions -------------------------

// Get stat abbreviation for mobile
export function getStatAbbr(statName: string) {
  const abbrs: Record<string, string> = {
    hp: 'HP',
    attack: 'ATK',
    defense: 'DEF',
    'special-attack': 'SP.ATK',
    'special-defense': 'SP.DEF',
    speed: 'SPD',
  };
  return abbrs[statName];
}

// Get full stat name
export const getStatName = (statName: string) => {
  const displayNames: Record<string, string> = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    speed: 'Speed',
  };
  return displayNames[statName];
};

/**
 * Converts an array of Pokemon stats to a simple StatValues object
 *
 * @param statsArray - Array of Pokemon stats from database
 * @returns Simple object with stat names as keys and base stat values
 */
export const convertStatsArrayToValues = (statsArray: PokemonStats): StatValues => {
  const result: StatValues = {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  };

  const keyMap: Record<string, keyof StatValues> = {
    hp: 'hp',
    attack: 'attack',
    defense: 'defense',
    'special-attack': 'specialAttack',
    'special-defense': 'specialDefense',
    speed: 'speed',
  };

  for (const stat of statsArray) {
    const mappedKey = keyMap[stat.stat.name];
    if (mappedKey) {
      result[mappedKey] = stat.baseStat;
    }
  }

  return result;
};

// Validates stat calculation parameters
function validateStatParams(params: StatCalculationParams): void {
  const { baseStat, iv, ev, level, natureModifier = 1.0 } = params;

  if (!Number.isInteger(baseStat) || baseStat < 0 || baseStat > 255) {
    throw new Error('Base stat must be an integer between 0 and 255');
  }
  if (!Number.isInteger(iv) || iv < 0 || iv > 31) {
    throw new Error('IV must be an integer between 0 and 31');
  }
  if (!Number.isInteger(ev) || ev < 0 || ev > 252) {
    throw new Error('EV must be an integer between 0 and 252');
  }
  if (!Number.isInteger(level) || level < 1 || level > 100) {
    throw new Error('Level must be an integer between 1 and 100');
  }
  if (natureModifier !== 0.9 && natureModifier !== 1.0 && natureModifier !== 1.1) {
    throw new Error('Nature modifier must be 0.9, 1.0, or 1.1');
  }
}

/**
 * Calculates a Pokemon's stat value using the official Pokemon stat formula
 *
 * For non-HP stats: ⌊((2×B + I + ⌊E/4⌋)/100 × L) + 5) × N⌋
 * For HP stats: ⌊((2×B + I + ⌊E/4⌋)/100 × L) + L + 10⌋
 *
 * At level 100:
 * - HP: 2×B + I + ⌊E/4⌋ + 110
 * - Other stats: (2×B + I + ⌊E/4⌋ + 5) × N
 */
export function calculateStat(params: StatCalculationParams): number {
  try {
    validateStatParams(params);
  } catch (error) {
    throw new Error(
      `Stat calculation failed: ${error instanceof Error ? error.message : 'Unknown validation error'}`,
    );
  }

  const { baseStat, iv, ev, level, natureModifier = 1.0, isHpStat = false } = params;
  const evTerm = Math.floor(ev / 4);

  if (level === 100) {
    if (isHpStat) {
      return 2 * baseStat + iv + evTerm + 110;
    } else {
      return Math.floor((2 * baseStat + iv + evTerm + 5) * natureModifier);
    }
  }

  if (isHpStat) {
    const baseCalculation = Math.floor(((2 * baseStat + iv + evTerm) / 100) * level);
    return baseCalculation + level + 10;
  } else {
    const baseCalculation = Math.floor(((2 * baseStat + iv + evTerm) / 100) * level) + 5;
    return Math.floor(baseCalculation * natureModifier);
  }
}

// Calculates all stats for a Pokemon given base stats and parameters
export function calculateAllStats(
  baseStats: StatValues,
  params: {
    level: number;
    ivs: StatValues;
    evs: StatValues;
    natureModifiers?: Partial<Record<keyof StatValues, number>>;
  },
): StatValues {
  const { level, ivs, evs, natureModifiers = {} } = params;
  const results = {} as StatValues;

  for (const statName of statNames) {
    const isHpStat = statName === 'hp';

    results[statName] = calculateStat({
      baseStat: baseStats[statName],
      iv: ivs[statName],
      ev: evs[statName],
      level,
      natureModifier: isHpStat ? 1.0 : (natureModifiers[statName] ?? 1.0),
      isHpStat,
    });
  }

  return results;
}

/**
 * Calculates comprehensive stat ranges for a Pokemon across all common scenarios
 * Used for competitive analysis and stat comparison
 *
 * @param baseStats - Pokemon's base stats
 * @returns Complete stat ranges for all stats, levels, natures, and IV combinations
 */

export function calculateStatRanges(baseStats: StatValues): ComprehensiveStatRanges {
  const results = {} as ComprehensiveStatRanges;

  for (const statName of statNames) {
    const baseStat = baseStats[statName];
    const isHpStat = statName === 'hp';

    results[statName] = {
      level50: {},
      level100: {},
    } as StatRanges;

    for (const level of [50, 100]) {
      const levelKey = level === 50 ? 'level50' : 'level100';

      for (const [natureType, modifier] of Object.entries(natureModifiers)) {
        const actualModifier = isHpStat ? 1.0 : modifier;

        const min = calculateStat({
          baseStat,
          iv: 0,
          ev: 0,
          level,
          natureModifier: actualModifier,
          isHpStat,
        });

        const max = calculateStat({
          baseStat,
          iv: 31,
          ev: 252,
          level,
          natureModifier: actualModifier,
          isHpStat,
        });

        results[statName][levelKey][natureType as keyof typeof natureModifiers] = { min, max };
      }
    }
  }
  return results;
}

// Helper function to get formatted stat range strings for display
export function formatStatRange(
  statRanges: ComprehensiveStatRanges,
  statName: keyof StatValues,
  level: 50 | 100,
  nature: 'beneficial' | 'neutral' | 'hindering',
): string {
  const levelKey = level === 50 ? 'level50' : 'level100';
  const range = statRanges[statName][levelKey][nature];
  return `${range.min}-${range.max}`;
}

/**
 * Get stat ranges summary for competitive reference
 * Returns the most commonly used ranges (Level 50 and 100 with max IVs/EVs)
 */
export function getCompetitiveStatRanges(baseStats: StatValues): CompetitiveRanges {
  const fullRanges = calculateStatRanges(baseStats);
  const result: CompetitiveRanges = {
    level50: {} as CompetitiveRanges['level50'],
    level100: {} as CompetitiveRanges['level100'],
  };

  for (const statName of statNames) {
    if (statName === 'hp') {
      result.level50[statName] = { neutral: fullRanges[statName].level50.neutral };
      result.level100[statName] = { neutral: fullRanges[statName].level100.neutral };
    } else {
      result.level50[statName] = {
        beneficial: fullRanges[statName].level50.beneficial,
        neutral: fullRanges[statName].level50.neutral,
        hindering: fullRanges[statName].level50.hindering,
      };
      result.level100[statName] = {
        beneficial: fullRanges[statName].level100.beneficial,
        neutral: fullRanges[statName].level100.neutral,
        hindering: fullRanges[statName].level100.hindering,
      };
    }
  }

  return result;
}
