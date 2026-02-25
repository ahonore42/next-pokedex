'use client';

import type { StatValues } from './types';

const STAT_DISPLAY: Record<keyof StatValues, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  specialAttack: 'Sp. Atk',
  specialDefense: 'Sp. Def',
  speed: 'Speed',
};

// Thresholds scale with level so colours remain meaningful at both lv.50 and lv.100
export function computedStatColor(value: number, level: 50 | 100): string {
  const s = level === 100 ? 2 : 1;
  if (value >= 180 * s) return 'text-green-500';
  if (value >= 150 * s) return 'text-lime-500';
  if (value >= 120 * s) return 'text-yellow-500';
  if (value >= 80 * s) return 'text-orange-500';
  return 'text-red-500';
}

interface StatRowProps {
  statKey: keyof StatValues;
  baseVal: number;
  iv: number;
  ev: number;
  computedVal: number;
  natureModifier: number;
  level: 50 | 100;
  ivMax: number;
  onChangeIV: (raw: string) => void;
  onChangeEV: (raw: string) => void;
}

export default function StatRow({
  statKey,
  baseVal,
  iv,
  ev,
  computedVal,
  natureModifier,
  level,
  ivMax,
  onChangeIV,
  onChangeEV,
}: StatRowProps) {
  const isUp = natureModifier === 1.1;
  const isDown = natureModifier === 0.9;
  const displayName = STAT_DISPLAY[statKey];
  const colorClass = computedStatColor(computedVal, level);
  const ivLabel = ivMax === 15 ? 'DV' : 'IV';

  return (
    <div className="px-1 py-0.5 rounded hover:bg-surface">
      <div className="grid grid-cols-[5.5rem_2rem_3.5rem_4rem] sm:grid-cols-[5.5rem_2rem_3.5rem_4rem_3rem] gap-x-2 items-center">
        {/* Stat name */}
        <span
          className={[
            'text-sm font-medium truncate',
            isUp ? 'text-red-500' : isDown ? 'text-blue-500' : 'text-primary',
          ].join(' ')}
        >
          {displayName}
          {isUp && <span className="ml-0.5 text-xs">↑</span>}
          {isDown && <span className="ml-0.5 text-xs">↓</span>}
        </span>

        {/* Base stat */}
        <span className="text-xs text-subtle text-right tabular-nums">{baseVal}</span>

        {/* IV/DV */}
        <input
          type="number"
          min={0}
          max={ivMax}
          value={iv}
          onChange={(e) => onChangeIV(e.target.value)}
          className="w-full px-1 py-0.5 text-xs text-center rounded border border-border bg-surface focus:outline-none focus:border-indigo-400 tabular-nums"
          aria-label={`${displayName} ${ivLabel}`}
        />

        {/* EV — 0–252, total ≤ 510 (Gen 3+) or independent ≤ 252 (Gen 1–2) */}
        <input
          type="number"
          min={0}
          max={252}
          value={ev}
          onChange={(e) => onChangeEV(e.target.value)}
          className="w-full px-1 py-0.5 text-xs text-center rounded border border-border bg-surface focus:outline-none focus:border-indigo-400 tabular-nums"
          aria-label={`${displayName} EV`}
        />

        {/* Computed stat — sm+ inline */}
        <span className={`hidden sm:block text-xs font-semibold text-right tabular-nums ${colorClass}`}>
          {computedVal}
        </span>
      </div>
    </div>
  );
}
