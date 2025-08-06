import {
  PokemonEncounter,
  PokemonEncounters,
  EncounterConditions,
  EncounterVersionGroup,
  EncounterLocationArea,
  EncounterLocation,
} from '~/server/routers/_app';

// -------------------- Types -----------------------------

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

type LocationArea = {
  locationName: string;
  mainLocationName: string;
  mainLocationId: number;
  location: EncounterLocation;
  locationArea: EncounterLocationArea;
  encounters: PokemonEncounters;
};

type LocationGroupResult = {
  mainLocationName: string;
  mainLocationId: number;
  locationAreas: LocationArea[];
};

type GroupedEncounters = Record<string, PokemonEncounter & { allConditions: EncounterConditions }>;

type MergedEncounter = PokemonEncounter & {
  allConditions: EncounterConditions;
  levelChancePairs: LevelChancePair[];
};

type VersionGroupEncounter = {
  versionGroupName: string;
  versionGroup: EncounterVersionGroup;
  encounters: PokemonEncounters;
};

export type EncountersByVersionGroup = Record<number, VersionGroupEncounter>;
export type EncountersGroupedByLocation = Record<number, LocationGroupResult>;
export type MergedGroupedEncounters = Record<string, MergedEncounter>;

// -------------------- Functions -------------------------

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
