'use client';

import React, { useMemo, useCallback } from 'react';
import {
  type StatValues,
  statNames,
  calculateAllStats,
  calculateStat,
} from '~/utils/pokemon-stats';
import { NATURES } from '~/utils/natures';
import { getGenFeatures } from '~/utils/generation-rules';
import StatHexagon, { type StatDragInfo } from '~/components/pokemon/StatHexagon';
import LevelToggle from './LevelToggle';
import StatTable from './StatTable';

// ─── Constants ────────────────────────────────────────────────────────────────

const TO_DB_NAME: Record<keyof StatValues, string> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  specialAttack: 'special-attack',
  specialDefense: 'special-defense',
  speed: 'speed',
};

const DISPLAY_TO_KEY: Record<string, keyof StatValues> = {
  Attack: 'attack',
  Defense: 'defense',
  'Sp. Atk': 'specialAttack',
  'Sp. Def': 'specialDefense',
  Speed: 'speed',
};

// Maps StatHexagon's STAT_ORDER indices to StatValues keys
// STAT_ORDER = ['hp', 'attack', 'defense', 'speed', 'special-defense', 'special-attack']
const HEXAGON_IDX_TO_KEY: (keyof StatValues)[] = [
  'hp',
  'attack',
  'defense',
  'speed',
  'specialDefense',
  'specialAttack',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNatureModifiers(natureName: string | null): Partial<Record<keyof StatValues, number>> {
  if (!natureName) return {};
  const nature = NATURES.find((n) => n.name === natureName);
  if (!nature?.increased) return {};
  const modifiers: Partial<Record<keyof StatValues, number>> = {};
  if (nature.increased) modifiers[DISPLAY_TO_KEY[nature.increased]] = 1.1;
  if (nature.decreased) modifiers[DISPLAY_TO_KEY[nature.decreased]] = 0.9;
  return modifiers;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatsEditorProps {
  baseStats: StatValues;
  ivs: StatValues;
  evs: StatValues;
  level: 50 | 100;
  natureName: string | null;
  generation: number;
  onChangeIVs: (ivs: StatValues) => void;
  onChangeEVs: (evs: StatValues) => void;
  onChangeLevel: (level: 50 | 100) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StatsEditor({
  baseStats,
  ivs,
  evs,
  level,
  natureName,
  generation,
  onChangeIVs,
  onChangeEVs,
  onChangeLevel,
}: StatsEditorProps) {
  const { ivMax, hasEvCap } = getGenFeatures(generation);

  const natureModifiers = useMemo(() => getNatureModifiers(natureName), [natureName]);

  const computed = useMemo(
    () => calculateAllStats(baseStats, { level, ivs, evs, natureModifiers }),
    [baseStats, level, ivs, evs, natureModifiers],
  );

  const evTotal = useMemo(() => statNames.reduce((sum, k) => sum + evs[k], 0), [evs]);
  const evRemaining = hasEvCap ? 510 - evTotal : 252 * 6 - evTotal;

  const hexStats = useMemo(
    () => statNames.map((key) => ({ stat: { name: TO_DB_NAME[key] }, baseStat: computed[key] })),
    [computed],
  );

  // Hexagon scale: base 200 as a consistent floor; expands if any base stat exceeds 200
  const hexMaxValue = useMemo(() => {
    const maxKey = statNames.reduce(
      (best, k) => (baseStats[k] > baseStats[best] ? k : best),
      statNames[0],
    );
    const referenceBase = Math.max(baseStats[maxKey], 200);
    return calculateStat({
      baseStat: referenceBase,
      iv: ivMax,
      ev: 252,
      level,
      natureModifier: 1.0,
      isHpStat: maxKey === 'hp',
    });
  }, [baseStats, level, ivMax]);

  const hexColorMax = level === 50 ? 250 : 500;

  // Drag bounds for each vertex — indexed by STAT_ORDER (hexagon axis order)
  const dragInfo = useMemo((): StatDragInfo[] => {
    return HEXAGON_IDX_TO_KEY.map((key) => {
      const isHp = key === 'hp';
      const natureMod = isHp ? 1.0 : (natureModifiers[key] ?? 1.0);
      const maxPossibleEV = Math.min(252, evs[key] + evRemaining);
      const minStat = calculateStat({
        baseStat: baseStats[key],
        iv: 0,
        ev: 0,
        level,
        natureModifier: natureMod,
        isHpStat: isHp,
      });
      const maxStat = calculateStat({
        baseStat: baseStats[key],
        iv: ivMax,
        ev: maxPossibleEV,
        level,
        natureModifier: natureMod,
        isHpStat: isHp,
      });
      return { minStat, maxStat };
    });
  }, [baseStats, level, natureModifiers, evs, evRemaining, ivMax]);

  // Convert drag fraction (0–1) into IV + EV for one stat.
  // T = iv + floor(ev/4) ranges from 0 to ivMax + floor(maxPossibleEV/4).
  // IVs fill first (0→ivMax) then EVs (0→maxPossibleEV).
  const handleDragStat = useCallback(
    (statIdx: number, fraction: number) => {
      const key = HEXAGON_IDX_TO_KEY[statIdx];
      const maxPossibleEV = Math.min(252, evs[key] + evRemaining);
      const maxT = ivMax + Math.floor(maxPossibleEV / 4);
      const targetT = Math.round(fraction * maxT);
      const newIV = Math.min(ivMax, Math.max(0, targetT));
      const newEV = Math.min(maxPossibleEV, Math.max(0, (targetT - newIV) * 4));
      if (newIV !== ivs[key]) onChangeIVs({ ...ivs, [key]: newIV });
      if (newEV !== evs[key]) onChangeEVs({ ...evs, [key]: newEV });
    },
    [ivs, evs, evRemaining, ivMax, onChangeIVs, onChangeEVs],
  );

  return (
    <div>
      {/* Header row */}

      <div className="flex flex-col sm:flex-row md:flex-col xl:flex-row items-center justify-center gap-8 pb-4">
        <div>
          <div className="flex items-center justify-start gap-4 pb-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-primary uppercase tracking-wide">
                Stats
              </label>
              <LevelToggle value={level} onChange={onChangeLevel} />
            </div>
            {hasEvCap && (
              <span
                className={`text-xs font-medium ${evTotal > 510 ? 'text-red-500' : 'text-subtle'}`}
              >
                EVs: {evTotal} / 510
                {evRemaining > 0 && evRemaining < 8 && (
                  <span className="ml-1 text-orange-400">({evRemaining} left)</span>
                )}
              </span>
            )}
          </div>
          <StatTable
            baseStats={baseStats}
            ivs={ivs}
            evs={evs}
            computed={computed}
            natureModifiers={natureModifiers}
            level={level}
            evRemaining={evRemaining}
            ivMax={ivMax}
            onChangeIVs={onChangeIVs}
            onChangeEVs={onChangeEVs}
          />
        </div>

        <div className="flex items-center justify-center">
          <StatHexagon
            stats={hexStats}
            size={220}
            className="w-full h-auto max-w-96"
            maxValue={hexMaxValue}
            colorMax={hexColorMax}
            dragInfo={dragInfo}
            onDragStat={handleDragStat}
          />
        </div>
      </div>
    </div>
  );
}
