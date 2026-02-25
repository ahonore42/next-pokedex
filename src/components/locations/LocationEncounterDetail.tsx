import React from 'react';
import Link from 'next/link';
import type { LocationDetailOutput } from '~/server/routers/_app';
import ExpandableCard from '../ui/ExpandableCard';
import Sprite from '../ui/Sprite';
import {
  calculateLevelSections,
  getEncounterChanceColor,
  getEncounterMethodIcon,
  LevelChancePair,
} from '~/utils';
import { capitalizeName } from '~/utils/text';

interface LocationEncounterDetailProps {
  location: LocationDetailOutput;
}

type LocationArea = LocationDetailOutput['areas'][number];

interface PokemonInMethod {
  id: number;
  name: string;
  sprite: string | null;
  levelSections: ReturnType<typeof calculateLevelSections>;
}

interface MethodGroup {
  methodName: string;
  methodIcon: string;
  conditions: string[];
  hasConditions: boolean;
  pokemon: PokemonInMethod[];
}

interface AreaInVG {
  areaId: number;
  areaName: string;
  methods: MethodGroup[];
}

interface VGGroup {
  vgId: number;
  vgFormattedName: string;
  pokemonCount: number;
  areas: AreaInVG[];
}

function groupByVersionGroup(areas: LocationArea[]): VGGroup[] {
  // vgId → { vgFormattedName, areaId → { areaName, methodKey → { method, pokemonId → { pokemon, levelChancePairs } } } }
  const vgMap = new Map<
    number,
    {
      vgId: number;
      vgFormattedName: string;
      areas: Map<
        number,
        {
          areaId: number;
          areaName: string;
          methods: Map<
            string,
            {
              methodName: string;
              methodIcon: string;
              conditions: string[];
              pokemon: Map<number, { id: number; name: string; sprite: string | null; levelChancePairs: LevelChancePair[] }>;
            }
          >;
        }
      >;
    }
  >();

  for (const area of areas) {
    const areaName = area.names[0]?.name ?? capitalizeName(area.name);

    for (const enc of area.pokemonEncounters) {
      const vg = enc.version.versionGroup;
      const vgFormattedName = vg.versions.map((v) => v.name.replaceAll('-', ' ')).join(' & ');

      if (!vgMap.has(vg.id)) {
        vgMap.set(vg.id, { vgId: vg.id, vgFormattedName, areas: new Map() });
      }
      const vgEntry = vgMap.get(vg.id)!;

      if (!vgEntry.areas.has(area.id)) {
        vgEntry.areas.set(area.id, { areaId: area.id, areaName, methods: new Map() });
      }
      const areaEntry = vgEntry.areas.get(area.id)!;

      const methodName = enc.encounterMethod.names[0]?.name ?? enc.encounterMethod.name;
      const conditions = enc.conditionValueMap
        .map((c) => c.encounterConditionValue.names[0]?.name ?? c.encounterConditionValue.name)
        .sort();
      const methodKey = `${methodName}|${conditions.join(',')}`;

      if (!areaEntry.methods.has(methodKey)) {
        areaEntry.methods.set(methodKey, {
          methodName,
          methodIcon: getEncounterMethodIcon(enc.encounterMethod.name),
          conditions,
          pokemon: new Map(),
        });
      }
      const methodEntry = areaEntry.methods.get(methodKey)!;

      if (!methodEntry.pokemon.has(enc.pokemon.id)) {
        methodEntry.pokemon.set(enc.pokemon.id, {
          id: enc.pokemon.id,
          name: enc.pokemon.name,
          sprite: enc.pokemon.sprites?.frontDefault ?? null,
          levelChancePairs: [],
        });
      }
      methodEntry.pokemon.get(enc.pokemon.id)!.levelChancePairs.push({
        minLevel: enc.minLevel,
        maxLevel: enc.maxLevel,
        chance: enc.chance,
      });
    }
  }

  return Array.from(vgMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, vgEntry]) => {
      const areaList = Array.from(vgEntry.areas.values()).map((areaEntry) => ({
        areaId: areaEntry.areaId,
        areaName: areaEntry.areaName,
        methods: Array.from(areaEntry.methods.values()).map((m) => {
          const pokemonList = Array.from(m.pokemon.values()).map((pkm) => ({
            id: pkm.id,
            name: pkm.name,
            sprite: pkm.sprite,
            levelSections: calculateLevelSections(pkm.levelChancePairs),
          }));
          return {
            methodName: m.methodName,
            methodIcon: m.methodIcon,
            conditions: m.conditions,
            hasConditions: m.conditions.length > 0,
            pokemon: pokemonList,
          };
        }),
      }));

      const pokemonCount = areaList.reduce(
        (sum, a) => sum + a.methods.reduce((s2, m) => s2 + m.pokemon.length, 0),
        0,
      );

      return {
        vgId: vgEntry.vgId,
        vgFormattedName: vgEntry.vgFormattedName,
        pokemonCount,
        areas: areaList,
      };
    });
}

export default function LocationEncounterDetail({ location }: LocationEncounterDetailProps) {
  const vgGroups = React.useMemo(() => groupByVersionGroup(location.areas), [location.areas]);
  const hasMultipleAreas = location.areas.length > 1;

  if (vgGroups.length === 0) {
    return (
      <p className="text-sm text-subtle italic py-2">No encounter data available for this location.</p>
    );
  }

  return (
    <div className="space-y-3 pt-2" onClick={(e) => e.stopPropagation()}>
      {vgGroups.map((vg) => (
        <ExpandableCard
          key={vg.vgId}
          title={vg.vgFormattedName}
          tag={`${vg.pokemonCount} Pokémon`}
          variant="compact"
          className="border border-border"
        >
          <div className="space-y-4">
            {vg.areas.map((area) => (
              <div key={area.areaId}>
                {hasMultipleAreas && (
                  <h5 className="text-sm font-medium text-secondary mb-2 flex items-center gap-1">
                    <span>📍</span>
                    {area.areaName}
                  </h5>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {area.methods.map((method) => (
                    <div
                      key={`${method.methodName}-${method.conditions.join(',')}`}
                      className="bg-surface rounded-lg p-3 border border-border"
                    >
                      {/* Method header */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{method.methodIcon}</span>
                        <span className="text-sm font-medium text-primary capitalize">
                          {method.methodName}
                        </span>
                      </div>

                      {/* Conditions */}
                      {method.hasConditions && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {method.conditions.map((cond, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs capitalize"
                            >
                              {cond}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Pokémon list */}
                      <div className="space-y-2">
                        {method.pokemon.map((pkm) => (
                          <div key={pkm.id} className="flex items-center gap-1">
                            <Sprite src={pkm.sprite ?? undefined} alt={pkm.name} variant="xs" />
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/pokedex/${pkm.id}`}
                                className="text-sm font-medium text-brand hover:text-brand-hover capitalize truncate block"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {capitalizeName(pkm.name)}
                              </Link>
                              <div className="space-y-0.5">
                                {pkm.levelSections.map((s, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-xs">
                                    <span className="text-subtle">
                                      {s.minLevel === s.maxLevel
                                        ? `Lv ${s.minLevel}`
                                        : `Lv ${s.minLevel}–${s.maxLevel}`}
                                    </span>
                                    <span className={`font-semibold ${getEncounterChanceColor(s.cumulativeChance)}`}>
                                      {s.cumulativeChance}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ExpandableCard>
      ))}
    </div>
  );
}
