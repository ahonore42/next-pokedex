'use client';

import { statNames } from '~/utils/pokemon-stats';
import type { StatValues } from './types';
import StatRow, { computedStatColor } from './StatRow';

interface StatTableProps {
  baseStats: StatValues;
  ivs: StatValues;
  evs: StatValues;
  computed: StatValues;
  natureModifiers: Partial<Record<keyof StatValues, number>>;
  level: 50 | 100;
  evRemaining: number;
  ivMax: number;
  onChangeIVs: (ivs: StatValues) => void;
  onChangeEVs: (evs: StatValues) => void;
}

export default function StatTable({
  baseStats,
  ivs,
  evs,
  computed,
  natureModifiers,
  level,
  evRemaining,
  ivMax,
  onChangeIVs,
  onChangeEVs,
}: StatTableProps) {
  const handleIV = (key: keyof StatValues, raw: string) => {
    const val = Math.min(ivMax, Math.max(0, parseInt(raw, 10) || 0));
    onChangeIVs({ ...ivs, [key]: val });
  };

  const handleEV = (key: keyof StatValues, raw: string) => {
    const parsed = parseInt(raw, 10) || 0;
    const headroom = evRemaining + evs[key];
    const val = Math.min(252, Math.max(0, Math.min(parsed, headroom)));
    onChangeEVs({ ...evs, [key]: val });
  };

  return (
    <div className="shrink-0">
      {/* Column headers */}
      <div className="grid grid-cols-[5.5rem_2rem_3.5rem_4rem] sm:grid-cols-[5.5rem_2rem_3.5rem_4rem_3rem] gap-x-2 mb-1 px-1">
        <span className="text-xs text-subtle">Stat</span>
        <span className="text-xs text-subtle text-right">Base</span>
        <span className="text-xs text-subtle text-center">{ivMax === 15 ? 'DV' : 'IV'}</span>
        <span className="text-xs text-subtle text-center">EV</span>
        <span className="hidden sm:block text-xs text-subtle text-right">Final</span>
      </div>

      <div className="space-y-1">
        {statNames.map((key) => (
          <StatRow
            key={key}
            statKey={key}
            baseVal={baseStats[key]}
            iv={ivs[key]}
            ev={evs[key]}
            computedVal={computed[key]}
            natureModifier={natureModifiers[key] ?? 1.0}
            level={level}
            ivMax={ivMax}
            onChangeIV={(raw) => handleIV(key, raw)}
            onChangeEV={(raw) => handleEV(key, raw)}
          />
        ))}
      </div>

      {/* Final row — xs only, all six computed values in one row */}
      <div className="sm:hidden flex items-center justify-between gap-1 mt-2 pt-1.5 px-1 border-t border-border">
        <span className="text-xs text-subtle shrink-0">Final</span>
        <div className="flex gap-2.5">
          {statNames.map((key) => (
            <span
              key={key}
              className={`text-xs font-semibold tabular-nums ${computedStatColor(computed[key], level)}`}
            >
              {computed[key]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
