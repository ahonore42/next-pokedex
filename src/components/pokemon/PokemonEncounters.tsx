import type { PokemonInSpecies } from '~/server/routers/_app';
import ExpandableCard from '../ui/ExpandableCard';
import {
  calculateLevelSections,
  getEncounterChanceColor,
  getEncounterMethodIcon,
  LevelChancePair,
  groupEncountersByLocation,
  groupEncountersByVersionGroup,
  groupEncountersByMethodLevelChance,
  mergeGroupedEncounters,
  getUniqueConditions,
} from '~/utils/pokemon';

interface PokemonEncounterProps {
  encounters: PokemonInSpecies['encounters'];
}

export const PokemonEncounters: React.FC<PokemonEncounterProps> = ({ encounters }) => {
  // Group encounters by version group first
  const versionGroupEncounters = groupEncountersByVersionGroup(encounters);

  // Helper function to render combined level chances
  const renderLevelChances = (levelChancePairs: LevelChancePair[]) => {
    const sections = calculateLevelSections(levelChancePairs);

    return sections.map((section, sectionIndex) => (
      <div key={sectionIndex} className="flex items-center gap-2">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {section.minLevel === section.maxLevel
            ? `Level ${section.minLevel}:`
            : `Level ${section.minLevel}-${section.maxLevel}:`}
        </div>
        <div
          className={`text-sm font-semibold ${getEncounterChanceColor(section.cumulativeChance)}`}
        >
          {section.cumulativeChance}%
        </div>
      </div>
    ));
  };

  if (!encounters.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Locations</h2>
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>No encounter data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Locations ({Object.keys(versionGroupEncounters).length} version groups)
      </h2>

      <div className="space-y-6">
        {Object.entries(versionGroupEncounters).map(([versionGroupId, versionGroupData]) => {
          const locationGroups = groupEncountersByLocation(versionGroupData.encounters);
          const totalMainLocations = Object.keys(locationGroups).length;
          const formattedVersionGroupName = versionGroupData.versionGroup.versions
            .map((version) => version.name.replaceAll('-', ' '))
            .join(' & ');
          console.log(versionGroupData);
          return (
            <ExpandableCard
              key={versionGroupId}
              className="border border-gray-200 dark:border-gray-600"
              title={formattedVersionGroupName}
              tag={`${totalMainLocations} location${totalMainLocations !== 1 ? 's' : ''}`}
              variant="default"
            >
              <div className="space-y-4">
                {Object.entries(locationGroups).map(([mainLocationId, mainLocationData]) => (
                  <div key={mainLocationId}>
                    {/* Main location header */}
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-lg">📍</span>
                      {mainLocationData.mainLocationName}
                      {mainLocationData.locationAreas.length > 1 && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({mainLocationData.locationAreas.length} areas)
                        </span>
                      )}
                    </h4>

                    {/* Location areas */}
                    <div
                      className={
                        mainLocationData.locationAreas.length > 1
                          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6'
                          : 'mb-6'
                      }
                    >
                      {mainLocationData.locationAreas.map((locationData, areaIndex) => {
                        const encounterGroups = groupEncountersByMethodLevelChance(locationData);
                        const groupedEncounters = mergeGroupedEncounters(encounterGroups);
                        return (
                          <div
                            key={areaIndex}
                            className={
                              mainLocationData.locationAreas.length > 1
                                ? 'flex flex-col'
                                : 'space-y-3'
                            }
                          >
                            {/* Show specific area name if different from main location */}
                            {mainLocationData.locationAreas.length > 1 &&
                              locationData.locationName !== locationData.mainLocationName && (
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  {locationData.locationName}
                                </h5>
                              )}

                            {/* Encounter Methods */}
                            <div
                              className={
                                mainLocationData.locationAreas.length > 1
                                  ? 'space-y-3'
                                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
                              }
                            >
                              {Object.values(groupedEncounters).map((encounter, index) => {
                                const methodName =
                                  encounter.encounterMethod.names[0]?.name ||
                                  encounter.encounterMethod.name;

                                return (
                                  <div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                                  >
                                    {/* Method */}
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-lg">
                                        {getEncounterMethodIcon(methodName)}
                                      </span>
                                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                        {methodName}
                                      </span>
                                    </div>

                                    {/* Level-Chance Pairs using new algorithm */}
                                    <div className="space-y-1 mb-2">
                                      {renderLevelChances(encounter.levelChancePairs)}
                                    </div>

                                    {/* Conditions */}
                                    {encounter.conditionValueMap.length > 0 && (
                                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          Conditions:
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {(() => {
                                            // Deduplicate conditions by their names
                                            const uniqueConditions = getUniqueConditions(encounter);

                                            return uniqueConditions.map(
                                              (conditionMap, conditionIndex) => (
                                                <span
                                                  key={conditionIndex}
                                                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs capitalize"
                                                >
                                                  {conditionMap.encounterConditionValue.names[0]
                                                    ?.name ||
                                                    conditionMap.encounterConditionValue.name}
                                                </span>
                                              ),
                                            );
                                          })()}
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
                ))}
              </div>
            </ExpandableCard>
          );
        })}
      </div>
    </div>
  );
};
