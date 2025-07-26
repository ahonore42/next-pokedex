import {
  PokemonStats,
  PokemonEncounters,
  PokemonEncounter,
  EncounterLocationArea,
  EncounterLocation,
  EncounterVersionGroup,
  EncounterConditions,
} from '~/server/routers/_app';
import { romanToInteger } from '~/utils/text';

// --------------------------
// Core Domain Types
// --------------------------
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

// --------------------------
// Utility/Configuration Types
// --------------------------
export type LevelChancePair = {
  minLevel: number;
  maxLevel: number;
  chance: number;
};

type LevelSection = {
  minLevel: number;
  maxLevel: number;
  cumulativeChance: number;
};

// --------------------------
// Location Types
// --------------------------
export type LocationArea = {
  locationName: string;
  mainLocationName: string;
  mainLocationId: number;
  location: EncounterLocation;
  locationArea: EncounterLocationArea;
  encounters: PokemonEncounters;
};

export type LocationGroupResult = {
  mainLocationName: string;
  mainLocationId: number;
  locationAreas: LocationArea[];
};

// --------------------------
// Encounter Types
// --------------------------
export type GroupedEncounters = Record<
  string,
  PokemonEncounter & { allConditions: EncounterConditions }
>;

export type MergedEncounter = PokemonEncounter & {
  allConditions: EncounterConditions;
  levelChancePairs: LevelChancePair[];
};

export type VersionGroupEncounter = {
  versionGroupName: string;
  versionGroup: EncounterVersionGroup;
  encounters: PokemonEncounters;
};

export type EncountersByVersionGroup = Record<number, VersionGroupEncounter>;
export type EncountersGroupedByLocation = Record<number, LocationGroupResult>;
export type MergedGroupedEncounters = Record<string, MergedEncounter>;

// --------------------------
// Stat Calculation Types
// --------------------------
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

type Gendered = readonly [
  male: { value: string; symbol: '♂'; color: string },
  female: { value: string; symbol: '♀'; color: string },
  genderless: null,
];

type Genderless = readonly [null, null, { value: 'Genderless' }];

type FormattedGenderRate = Gendered | Genderless;

/* ------------------------------------------------------------------ */
/* Reusable Mappings                                                  */
/* ------------------------------------------------------------------ */

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

// Starter pokemon ids
export const starterIds: Record<number, number[]> = {
  1: [1, 4, 7],
  2: [152, 155, 158],
  3: [252, 255, 258],
  4: [387, 390, 393],
  5: [495, 498, 501],
  6: [650, 653, 656],
  7: [722, 725, 728],
  8: [810, 813, 816],
  9: [906, 909, 912],
};

// Pokemon Game Color Map - Tailwind classes with proper contrast
export const pokemonGameColorMap = {
  // Generation 1
  red: { bg: 'bg-red-600/80', text: 'text-white' },
  blue: { bg: 'bg-blue-700/80', text: 'text-white' },
  yellow: { bg: 'bg-yellow-400/80', text: 'text-black' },

  // Generation 2
  gold: { bg: 'bg-amber-500/80', text: 'text-black' },
  silver: { bg: 'bg-gray-400/80', text: 'text-black' },
  crystal: { bg: 'bg-cyan-400/80', text: 'text-black' },

  // Generation 3
  ruby: { bg: 'bg-red-700/80', text: 'text-white' },
  sapphire: { bg: 'bg-blue-700/80', text: 'text-white' },
  emerald: { bg: 'bg-emerald-600/80', text: 'text-white' },
  firered: { bg: 'bg-orange-600/80', text: 'text-white' },
  leafgreen: { bg: 'bg-green-500/80', text: 'text-black' },

  // Generation 4
  diamond: { bg: 'bg-sky-200/80', text: 'text-black' },
  pearl: { bg: 'bg-pink-200/80', text: 'text-black' },
  platinum: { bg: 'bg-gray-500/80', text: 'text-white' },
  heartgold: { bg: 'bg-amber-500/80', text: 'text-black' },
  soulsilver: { bg: 'bg-gray-400/80', text: 'text-black' },

  // Generation 5
  black: { bg: 'bg-gray-800/80', text: 'text-white' },
  white: { bg: 'bg-gray-100/80', text: 'text-black' },
  'black-2': { bg: 'bg-gray-900/80', text: 'text-white' },
  'white-2': { bg: 'bg-white', text: 'text-black' },

  // Generation 6
  x: { bg: 'bg-blue-700/80', text: 'text-white' },
  y: { bg: 'bg-red-600/80', text: 'text-white' },
  'omega-ruby': { bg: 'bg-red-700/80', text: 'text-white' },
  'alpha-sapphire': { bg: 'bg-blue-600/80', text: 'text-white' },

  // Generation 7
  sun: { bg: 'bg-orange-500/80', text: 'text-black' },
  moon: { bg: 'bg-indigo-700/80', text: 'text-white' },
  'ultra-sun': { bg: 'bg-orange-600/80', text: 'text-white' },
  'ultra-moon': { bg: 'bg-indigo-900/80', text: 'text-white' },
  'lets-go-pikachu': { bg: 'bg-yellow-300/80', text: 'text-black' },
  'lets-go-eevee': { bg: 'bg-amber-600/80', text: 'text-white' },

  // Generation 8
  sword: { bg: 'bg-cyan-500/80', text: 'text-black' },
  shield: { bg: 'bg-red-700/80', text: 'text-white' },
  'legends-arceus': { bg: 'bg-stone-600/80', text: 'text-white' },

  // Generation 9
  scarlet: { bg: 'bg-red-600/80', text: 'text-white' },
  violet: { bg: 'bg-violet-600/80', text: 'text-white' },
} as const;

// Type for game names
export type PokemonGameName = keyof typeof pokemonGameColorMap;

/* ------------------------------------------------------------------ */
/* Utility Functions                                                  */
/* ------------------------------------------------------------------ */

export function getGenerationDisplayName(genId: number): string {
  const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  return `Generation ${romanNumerals[genId] || genId}`;
}

// Helper function to get color classes by game name (case-insensitive)
export const getGameColor = (gameName: string): { bg: string; text: string } => {
  const normalizedName = gameName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return (
    pokemonGameColorMap[normalizedName as keyof typeof pokemonGameColorMap] || {
      bg: 'bg-gray-500',
      text: 'text-white',
    }
  );
};

const formatPercentage = (percentage: number) =>
  percentage === 100 ? percentage : percentage.toFixed(1);

export function formatGenderRate(genderRate: number): FormattedGenderRate {
  if (genderRate === -1) {
    return [null, null, { value: 'Genderless' }] as const;
  }

  const male = {
    value: `${formatPercentage(((8 - genderRate) / 8) * 100)}%`,
    symbol: '♂' as const,
    color: 'text-blue-600 border-blue-300',
  };

  const female = {
    value: `${formatPercentage((genderRate / 8) * 100)}%`,
    symbol: '♀' as const,
    color: 'text-red-500 border-red-300',
  };

  return [male, female, null] as const;
}

// Utility function to get type color - Complete list
export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    normal: '#A8A878',
    fighting: '#C03028',
    flying: '#A890F0',
    poison: '#A040A0',
    ground: '#E0C068',
    rock: '#B8A038',
    bug: '#A8B820',
    ghost: '#705898',
    steel: '#B8B8D0',
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    psychic: '#F85888',
    ice: '#98D8D8',
    dragon: '#7038F8',
    dark: '#705848',
    fairy: '#EE99AC',
    stellar: '#40E0D0',
    unknown: '#68A090',
  };
  return colors[type] || '#68A090';
}

export const truncateTypeName = (name: string, format: 'short' | 'medium' = 'medium') => {
  switch (name.toLowerCase()) {
    case 'normal':
      return format === 'short' ? 'NOR' : 'NORMAL';
    case 'fire':
      return format === 'short' ? 'FIR' : 'FIRE';
    case 'water':
      return format === 'short' ? 'WAT' : 'WATER';
    case 'electric':
      return format === 'short' ? 'ELE' : 'ELECTR';
    case 'grass':
      return format === 'short' ? 'GRA' : 'GRASS';
    case 'ice':
      return 'ICE';
    case 'fighting':
      return format === 'short' ? 'FIG' : 'FIGHT';
    case 'poison':
      return format === 'short' ? 'POI' : 'POISON';
    case 'ground':
      return format === 'short' ? 'GRO' : 'GROUND';
    case 'flying':
      return format === 'short' ? 'FLY' : 'FLYING';
    case 'psychic':
      return format === 'short' ? 'PSY' : 'PSYCHC';
    case 'bug':
      return 'BUG';
    case 'rock':
      return format === 'short' ? 'ROC' : 'ROCK';
    case 'ghost':
      return format === 'short' ? 'GHO' : 'GHOST';
    case 'dragon':
      return format === 'short' ? 'DRA' : 'DRAGON';
    case 'dark':
      return format === 'short' ? 'DAR' : 'DARK';
    case 'steel':
      return format === 'short' ? 'STE' : 'STEEL';
    case 'fairy':
      return format === 'short' ? 'FAI' : 'FAIRY';
    case 'stellar':
      return format === 'short' ? 'STL' : 'STELLR';
    default:
      return 'N/A';
  }
};

export const getDamageFactorText = (factor: number) => {
  if (factor === 0) return '0';
  if (factor === 0.5) return '½';
  if (factor === 1) return '';
  if (factor === 2) return '2';
  return `${factor}`;
};

export const getDamageFactorColor = (factor: number) => {
  if (factor === 0) return 'bg-gray-900 text-white'; // No effect
  if (factor < 1) return 'bg-red-500 text-white'; // Not very effective
  if (factor > 1) return 'bg-green-500 text-white'; // Super effective
  return 'dark:bg-gray-500 bg-gray-100'; // Normal effect
};

// Get damage class icon
export const getDamageClassIcon = (damageClass: string) => {
  switch (damageClass) {
    case 'physical':
      return '💥'; // Physical
    case 'special':
      return '🌀'; // Special
    case 'status':
      return '⚡'; // Status
    default:
      return '❓';
  }
};

// Get damage class color
export const getDamageClassColor = (damageClass: string) => {
  switch (damageClass) {
    case 'physical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'special':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'status':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

/* ------------------------------------------------------------------ */
/* Pokedexes                                                          */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Encounters                                                         */
/* ------------------------------------------------------------------ */

// Encounter method icons
export function getEncounterMethodIcon(methodName: string) {
  const method = methodName.toLowerCase();
  if (method.includes('walk') || method.includes('land')) return '🚶';
  if (method.includes('surf') || method.includes('water')) return '🌊';
  if (method.includes('fish') || method.includes('rod')) return '🎣';
  if (method.includes('rock') || method.includes('smash')) return '🪨';
  if (method.includes('cut') || method.includes('headbutt')) return '🌳';
  if (method.includes('cave') || method.includes('dark')) return '🕳️';
  return '📍';
}

// Color indicators for encounter chance percentages
export function getEncounterChanceColor(chance: number) {
  if (chance >= 30) return 'text-green-600 dark:text-green-400';
  if (chance >= 15) return 'text-yellow-600 dark:text-yellow-400';
  if (chance >= 5) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

// Algorithm to handle overlapping level ranges and calculate cumulative chances
export function calculateLevelSections(levelChancePairs: LevelChancePair[]): LevelSection[] {
  if (levelChancePairs.length === 0) return [];

  // Remove duplicates first
  const uniquePairs = levelChancePairs.filter(
    (pair, index, arr) =>
      arr.findIndex(
        (p) =>
          p.minLevel === pair.minLevel && p.maxLevel === pair.maxLevel && p.chance === pair.chance,
      ) === index,
  );

  // If only one unique pair, return it as-is
  if (uniquePairs.length === 1) {
    return [
      {
        minLevel: uniquePairs[0].minLevel,
        maxLevel: uniquePairs[0].maxLevel,
        cumulativeChance: uniquePairs[0].chance,
      },
    ];
  }

  // Find absolute min and max levels
  const absoluteMinLevel = Math.min(...uniquePairs.map((p) => p.minLevel));
  const absoluteMaxLevel = Math.max(...uniquePairs.map((p) => p.maxLevel));

  // Collect all boundary points (start and end of each range)
  const boundaryPoints = new Set<number>();
  uniquePairs.forEach((pair) => {
    boundaryPoints.add(pair.minLevel);
    boundaryPoints.add(pair.maxLevel + 1); // +1 because ranges are inclusive
  });

  // Convert to sorted array
  const sortedBoundaries = Array.from(boundaryPoints).sort((a, b) => a - b);

  // Create sections between consecutive boundary points
  const sections: LevelSection[] = [];

  for (let i = 0; i < sortedBoundaries.length - 1; i++) {
    const sectionStart = sortedBoundaries[i];
    const sectionEnd = sortedBoundaries[i + 1] - 1; // -1 because we want inclusive ranges

    // Skip if section is outside our absolute range
    if (sectionEnd < absoluteMinLevel || sectionStart > absoluteMaxLevel) {
      continue;
    }

    // Adjust section to stay within absolute bounds
    const adjustedStart = Math.max(sectionStart, absoluteMinLevel);
    const adjustedEnd = Math.min(sectionEnd, absoluteMaxLevel);

    // Skip if adjusted section is invalid
    if (adjustedStart > adjustedEnd) {
      continue;
    }

    // Calculate cumulative chance for this section
    let cumulativeChance = 0;

    uniquePairs.forEach((pair) => {
      // Check if this pair's range overlaps with our section
      if (pair.minLevel <= adjustedEnd && pair.maxLevel >= adjustedStart) {
        cumulativeChance += pair.chance;
      }
    });

    // Only add section if it has a chance > 0
    if (cumulativeChance > 0) {
      sections.push({
        minLevel: adjustedStart,
        maxLevel: adjustedEnd,
        cumulativeChance,
      });
    }
  }

  return sections;
}

// Group encounters by version group
export const groupEncountersByVersionGroup = (
  encounters: PokemonEncounters,
): EncountersByVersionGroup => {
  return encounters.reduce<EncountersByVersionGroup>((acc, encounter) => {
    const version = encounter.version;
    const versionGroup = version.versionGroup || version;
    const versionGroupKey = versionGroup.id;
    const versionGroupName = versionGroup.name;

    if (!acc[versionGroupKey]) {
      acc[versionGroupKey] = {
        versionGroupName,
        versionGroup,
        encounters: [],
      };
    }

    acc[versionGroupKey].encounters.push(encounter);
    return acc;
  }, {});
};

// Group encounters by main location, then by specific location area
export function groupEncountersByLocation(
  versionGroupEncounters: PokemonEncounters,
): EncountersGroupedByLocation {
  // First grouping by specific location area
  const locationGroups = versionGroupEncounters.reduce<Record<number, LocationArea>>(
    (acc, encounter) => {
      const { locationArea } = encounter;
      const locationKey = locationArea.id;

      if (!acc[locationKey]) {
        acc[locationKey] = {
          locationName: locationArea.names[0]?.name || locationArea.name,
          mainLocationName: locationArea.location.names[0]?.name || locationArea.location.name,
          mainLocationId: locationArea.location.id,
          location: locationArea.location,
          locationArea,
          encounters: [],
        };
      }

      acc[locationKey].encounters.push(encounter);
      return acc;
    },
    {},
  );

  // Second grouping by main location - properly typed
  return Object.values(locationGroups).reduce<EncountersGroupedByLocation>(
    (result, locationData) => {
      const { mainLocationId } = locationData;

      if (!result[mainLocationId]) {
        result[mainLocationId] = {
          mainLocationName: locationData.mainLocationName,
          mainLocationId,
          locationAreas: [],
        };
      }

      result[mainLocationId].locationAreas.push(locationData);
      return result;
    },
    {},
  );
}

// Group encounters by method + level + chance (everything except conditions)
export const groupEncountersByMethodLevelChance = (locationArea: LocationArea): GroupedEncounters =>
  locationArea.encounters.reduce<GroupedEncounters>((acc, encounter) => {
    const methodName = encounter.encounterMethod.names[0]?.name || encounter.encounterMethod.name;
    const key = `${methodName}-${encounter.minLevel}-${encounter.maxLevel}-${encounter.chance}`;

    return {
      ...acc,
      [key]: {
        ...encounter,
        allConditions: [...(acc[key]?.allConditions ?? []), ...encounter.conditionValueMap],
      },
    };
  }, {});

// Group by method + merged conditions for final display
export const mergeGroupedEncounters = (
  groupedEncounters: GroupedEncounters,
): MergedGroupedEncounters =>
  Object.values(groupedEncounters).reduce<MergedGroupedEncounters>((acc, encounter) => {
    const methodName = encounter.encounterMethod.names[0]?.name || encounter.encounterMethod.name;
    const conditions = encounter.allConditions
      .map((cv) => cv.encounterConditionValue.names[0]?.name || cv.encounterConditionValue.name)
      .sort()
      .join(',');
    const key = `${methodName}-${conditions}`;

    if (!acc[key]) {
      acc[key] = {
        ...encounter,
        conditionValueMap: encounter.allConditions,
        levelChancePairs: [
          {
            minLevel: encounter.minLevel,
            maxLevel: encounter.maxLevel,
            chance: encounter.chance,
          },
        ],
      };
    } else {
      acc[key].levelChancePairs.push({
        minLevel: encounter.minLevel,
        maxLevel: encounter.maxLevel,
        chance: encounter.chance,
      });
    }
    return acc;
  }, {});

// Deduplicate conditions by their names
export const getUniqueConditions = (encounter: PokemonEncounter): EncounterConditions =>
  encounter.conditionValueMap.filter((conditionMap, index, arr) => {
    const conditionName =
      conditionMap.encounterConditionValue.names[0]?.name ||
      conditionMap.encounterConditionValue.name;
    return (
      arr.findIndex((c) => {
        const cName = c.encounterConditionValue.names[0]?.name || c.encounterConditionValue.name;
        return cName === conditionName;
      }) === index
    );
  });

/* ------------------------------------------------------------------ */
/* Pokemon Stats                                                      */
/* ------------------------------------------------------------------ */

// Default color function for bar chart colors
export const getBarColor = (value: number, maxValue: number): string => {
  const percentage = (value / maxValue) * 100;
  if (percentage >= 60) return 'bg-green-500';
  if (percentage >= 50) return 'bg-lime-500';
  if (percentage >= 40) return 'bg-yellow-500';
  if (percentage >= 25) return 'bg-orange-500';
  return 'bg-red-500';
};

// Get stat color based on value
export function getStatColor(baseStat: number, prefix: 'text' | 'bg' = 'bg') {
  if (prefix === 'bg' && baseStat >= 120) return 'bg-green-500';
  if (prefix === 'bg' && baseStat >= 100) return 'bg-lime-500';
  if (prefix === 'bg' && baseStat >= 80) return 'bg-yellow-500';
  if (prefix === 'bg' && baseStat >= 50) return 'bg-orange-500';
  if (prefix === 'text' && baseStat >= 120) return 'text-green-500';
  if (prefix === 'text' && baseStat >= 100) return 'text-lime-500';
  if (prefix === 'text' && baseStat >= 80) return 'text-yellow-500';
  if (prefix === 'text' && baseStat >= 50) return 'text-orange-500';
  return prefix === 'bg' ? 'bg-red-500' : 'text-red-500';
}

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
