import React from 'react';
import type {
  PokemonEncounters as PokemonEncountersType,
  EncounterConditions,
  PokemonEncounter,
} from '~/server/routers/_app';
import ExpandableCard from '../ui/ExpandableCard';
import GenerationFilter from '../pokedex/GenerationFilter';
import { useGenerationFilter, pokemonEncountersConfig } from '~/hooks';
import {
  calculateLevelSections,
  getEncounterChanceColor,
  getEncounterMethodIcon,
  LevelChancePair,
  groupEncountersByLocation,
  groupEncountersByVersionGroup,
  groupEncountersByMethodLevelChance,
  mergeGroupedEncounters,
} from '~/utils';

// Props
interface PokemonEncounterProps {
  encounters: PokemonEncountersType;
}

// Flat interfaces
interface FlatEncounter {
  id: string;
  versionGroupIndex: number;
  locationIndex: number;
  areaIndex: number;
  methodName: string;
  methodIcon: string;
  levelSections: ReturnType<typeof calculateLevelSections>;
  uniqueConditions: EncounterConditions;
  hasConditions: boolean;
}

interface FlatArea {
  id: string;
  versionGroupIndex: number;
  locationIndex: number;
  locationName: string;
  shouldShowAreaName: boolean;
  encounterIds: string[];
}

interface FlatLocation {
  id: string;
  versionGroupIndex: number;
  mainLocationName: string;
  areaIds: string[];
  hasMultipleAreas: boolean;
  areaCount: number;
}

interface FlatVersionGroup {
  id: string;
  formattedName: string;
  locationIds: string[];
  locationCount: number;
  locationCountText: string;
}

interface FlattenedData {
  versionGroups: FlatVersionGroup[];
  locations: Map<string, FlatLocation>;
  areas: Map<string, FlatArea>;
  encounters: Map<string, FlatEncounter>;
}

// Helper methods
const getUniqueConditionsOptimized = (encounter: PokemonEncounter): EncounterConditions => {
  const seen = new Set<string>();
  return encounter.conditionValueMap.filter((conditionMap) => {
    const name =
      conditionMap.encounterConditionValue.names[0]?.name ||
      conditionMap.encounterConditionValue.name;
    if (seen.has(name)) return false;
    seen.add(name);
    return true;
  });
};

const levelSectionsCache = new Map<string, ReturnType<typeof calculateLevelSections>>();
const getCachedLevelSections = (levelChancePairs: LevelChancePair[]) => {
  const key = JSON.stringify(levelChancePairs);
  if (!levelSectionsCache.has(key)) {
    levelSectionsCache.set(key, calculateLevelSections(levelChancePairs));
  }
  return levelSectionsCache.get(key)!;
};

// Key generator
const makeKey = {
  vg: (i: number) => `vg-${i}`,
  loc: (vg: number, loc: number) => `${vg}-${loc}`,
  area: (vg: number, loc: number, area: number) => `${vg}-${loc}-${area}`,
  enc: (vg: number, loc: number, area: number, enc: number) => `${vg}-${loc}-${area}-${enc}`,
};

export default function PokemonEncounters({ encounters }: PokemonEncounterProps) {
  // Generation filter - apply first to reduce dataset before complex processing
  const {
    selectedGenerationId,
    setSelectedGenerationId,
    filteredItems: filteredEncounters,
    availableGenerations,
  } = useGenerationFilter(encounters, pokemonEncountersConfig);

  // Single-pass flattening on the generation-filtered data
  const flattenedData = React.useMemo<FlattenedData>(() => {
    if (!filteredEncounters.length) {
      return {
        versionGroups: [],
        locations: new Map(),
        areas: new Map(),
        encounters: new Map(),
      };
    }

    const versionGroups: FlatVersionGroup[] = [];
    const locations = new Map<string, FlatLocation>();
    const areas = new Map<string, FlatArea>();
    const encountersMap = new Map<string, FlatEncounter>();

    const vgGroups = groupEncountersByVersionGroup(filteredEncounters);
    let vgIdx = 0;
    for (const vgKey in vgGroups) {
      const vgData = vgGroups[vgKey];
      const formattedName = vgData.versionGroup.versions
        .map((v) => v.name.replaceAll('-', ' '))
        .join(' & ');

      const locGroups = groupEncountersByLocation(vgData.encounters);
      const locIds: string[] = [];

      let locIdx = 0;
      for (const locKey in locGroups) {
        const locData = locGroups[locKey];
        const locId = makeKey.loc(vgIdx, locIdx);
        const hasMultipleAreas = locData.locationAreas.length > 1;
        const areaIds: string[] = [];

        locData.locationAreas.forEach((areaData, areaIdx) => {
          const areaId = makeKey.area(vgIdx, locIdx, areaIdx);
          const encGroups = groupEncountersByMethodLevelChance(areaData);
          const merged = mergeGroupedEncounters(encGroups);
          const encIds: string[] = [];

          let encIdx = 0;
          for (const enc of Object.values(merged)) {
            const encId = makeKey.enc(vgIdx, locIdx, areaIdx, encIdx);
            encountersMap.set(encId, {
              id: encId,
              versionGroupIndex: vgIdx,
              locationIndex: locIdx,
              areaIndex: areaIdx,
              methodName: enc.encounterMethod.names[0]?.name || enc.encounterMethod.name,
              methodIcon: getEncounterMethodIcon(enc.encounterMethod.name),
              levelSections: getCachedLevelSections(enc.levelChancePairs),
              uniqueConditions: getUniqueConditionsOptimized(enc),
              hasConditions: enc.conditionValueMap.length > 0,
            });
            encIds.push(encId);
            encIdx++;
          }

          areas.set(areaId, {
            id: areaId,
            versionGroupIndex: vgIdx,
            locationIndex: locIdx,
            locationName: areaData.locationName,
            shouldShowAreaName:
              hasMultipleAreas && areaData.locationName !== locData.mainLocationName,
            encounterIds: encIds,
          });
          areaIds.push(areaId);
        });

        locations.set(locId, {
          id: locId,
          versionGroupIndex: vgIdx,
          mainLocationName: locData.mainLocationName,
          areaIds,
          hasMultipleAreas,
          areaCount: locData.locationAreas.length,
        });
        locIds.push(locId);
        locIdx++;
      }

      const locCount = locIds.length;
      versionGroups.push({
        id: makeKey.vg(vgIdx),
        formattedName,
        locationIds: locIds,
        locationCount: locCount,
        locationCountText: `${locCount} location${locCount !== 1 ? 's' : ''}`,
      });
      vgIdx++;
    }

    return { versionGroups, locations, areas, encounters: encountersMap };
  }, [filteredEncounters]); // Changed dependency from encounters to filteredEncounters

  // Styles
  const cssClasses = React.useMemo(
    () => ({
      getLocationAreaGrid: (hasMultipleAreas: boolean) =>
        hasMultipleAreas ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6' : 'mb-6',
      getAreaContainer: (hasMultipleAreas: boolean) =>
        hasMultipleAreas ? 'flex flex-col' : 'space-y-3',
      getEncounterMethodsGrid: (hasMultipleAreas: boolean) =>
        hasMultipleAreas ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3',
    }),
    [],
  );

  // Render helpers
  const renderLevelSections = React.useCallback(
    (sections: ReturnType<typeof calculateLevelSections>) =>
      sections.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {s.minLevel === s.maxLevel
              ? `Level ${s.minLevel}:`
              : `Level ${s.minLevel}-${s.maxLevel}:`}
          </div>
          <div className={`text-sm font-semibold ${getEncounterChanceColor(s.cumulativeChance)}`}>
            {s.cumulativeChance}%
          </div>
        </div>
      )),
    [],
  );

  const renderConditionTags = React.useCallback(
    (conditions: EncounterConditions) =>
      conditions.map((c, i) => (
        <span
          key={i}
          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs capitalize"
        >
          {c.encounterConditionValue.names[0]?.name || c.encounterConditionValue.name}
        </span>
      )),
    [],
  );

  // Empty state
  if (!encounters.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <GenerationFilter
          title="Locations"
          selectedGenerationId={selectedGenerationId}
          setSelectedGenerationId={setSelectedGenerationId}
          availableGenerations={availableGenerations}
        />
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>No encounter data available</p>
        </div>
      </div>
    );
  }

  // No filtered encounters state
  if (!filteredEncounters.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <GenerationFilter
          title="Locations"
          selectedGenerationId={selectedGenerationId}
          setSelectedGenerationId={setSelectedGenerationId}
          availableGenerations={availableGenerations}
        />
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>No encounters found for the selected generation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <GenerationFilter
        title="Locations"
        selectedGenerationId={selectedGenerationId}
        setSelectedGenerationId={setSelectedGenerationId}
        availableGenerations={availableGenerations}
        titleClassName="text-2xl font-bold text-gray-900 dark:text-white mb-6"
        className="mb-0"
      />

      <div className="space-y-6">
        {flattenedData.versionGroups.map((vg) => (
          <ExpandableCard
            key={vg.id}
            className="border border-gray-200 dark:border-gray-600"
            title={vg.formattedName}
            tag={vg.locationCountText}
            variant="default"
          >
            <div className="space-y-4">
              {vg.locationIds.map((locId) => {
                const loc = flattenedData.locations.get(locId)!;
                return (
                  <div key={locId}>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-lg">📍</span>
                      {loc.mainLocationName}
                      {loc.hasMultipleAreas && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({loc.areaCount} areas)
                        </span>
                      )}
                    </h4>

                    <div className={cssClasses.getLocationAreaGrid(loc.hasMultipleAreas)}>
                      {loc.areaIds.map((areaId) => {
                        const area = flattenedData.areas.get(areaId)!;
                        return (
                          <div
                            key={areaId}
                            className={cssClasses.getAreaContainer(loc.hasMultipleAreas)}
                          >
                            {area.shouldShowAreaName && (
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {area.locationName}
                              </h5>
                            )}

                            <div
                              className={cssClasses.getEncounterMethodsGrid(loc.hasMultipleAreas)}
                            >
                              {area.encounterIds.map((encId) => {
                                const enc = flattenedData.encounters.get(encId)!;
                                return (
                                  <div
                                    key={encId}
                                    className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-lg">{enc.methodIcon}</span>
                                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                        {enc.methodName}
                                      </span>
                                    </div>

                                    <div className="space-y-1 mb-2">
                                      {renderLevelSections(enc.levelSections)}
                                    </div>

                                    {enc.hasConditions && (
                                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          Conditions:
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {renderConditionTags(enc.uniqueConditions)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ExpandableCard>
        ))}
      </div>
    </div>
  );
}
