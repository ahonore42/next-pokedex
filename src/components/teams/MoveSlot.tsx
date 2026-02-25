'use client';

import React, { useState, useMemo } from 'react';
import type { MovesetMove } from '~/server/routers/_app';
import TypeBadgesDisplay from '~/components/pokemon-types/TypeBadgesDisplay';
import { getMoveDisplayName } from './types';
import type { TeamMove } from './types';

const DAMAGE_CLASS_ICON: Record<string, string> = {
  physical: '💥',
  special: '✨',
  status: '—',
};

interface MoveSlotProps {
  slotIndex: number;
  move: TeamMove | null;
  allMoves: MovesetMove[];
  usedMoveIds: Set<number>;
  onChange: (move: TeamMove | null) => void;
  locked?: boolean;
}

export default function MoveSlot({
  slotIndex,
  move,
  allMoves,
  usedMoveIds,
  onChange,
  locked = false,
}: MoveSlotProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      allMoves
        .filter((m) => !usedMoveIds.has(m.id) || m.id === move?.id)
        .filter((m) => getMoveDisplayName(m).toLowerCase().includes(query.toLowerCase())),
    [allMoves, usedMoveIds, move, query],
  );

  const selectMove = (m: MovesetMove) => {
    onChange(m);
    setQuery('');
    setOpen(false);
  };

  const clearMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="relative">
      <button
        onClick={() => !locked && setOpen((v) => !v)}
        className={[
          'w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors',
          'flex items-center gap-2',
          locked
            ? 'border-border bg-surface cursor-default opacity-80'
            : move
              ? 'border-border bg-surface hover:border-indigo-300'
              : 'border-dashed border-border bg-surface/50 hover:border-indigo-300 text-subtle',
        ].join(' ')}
      >
        {move ? (
          <>
            <span className="text-base">
              {DAMAGE_CLASS_ICON[move.moveDamageClass?.name ?? 'status']}
            </span>
            <TypeBadgesDisplay types={[move.type.name]} compact />
            <span className="flex-1 text-primary capitalize">{getMoveDisplayName(move)}</span>
            {move.power && <span className="text-xs text-subtle ml-auto">{move.power}</span>}
            {locked ? (
              <span className="ml-1 text-xs text-subtle" title="Required for this form">🔒</span>
            ) : (
              <button
                onClick={clearMove}
                className="ml-1 text-subtle hover:text-red-500 text-xs"
                aria-label="Clear move"
              >
                ×
              </button>
            )}
          </>
        ) : (
          <span>Move {slotIndex + 1} — select</span>
        )}
      </button>

      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto">
          <div className="p-2 border-b border-border sticky top-0 bg-background">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search moves…"
              className="w-full px-2 py-1 text-sm rounded border border-border bg-surface focus:outline-none focus:border-indigo-400"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="p-3 text-sm text-subtle text-center">No moves found</p>
          ) : (
            filtered.map((m) => {
              const description =
                m.flavorTexts[0]?.flavorText ?? m.effectEntries[0]?.shortEffect ?? null;
              return (
                <button
                  key={m.id}
                  onClick={() => selectMove(m)}
                  className="w-full flex flex-col px-3 py-2 hover:bg-hover text-sm border-b border-border last:border-0 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base w-5 text-center shrink-0">
                      {DAMAGE_CLASS_ICON[m.moveDamageClass?.name ?? 'status']}
                    </span>
                    <TypeBadgesDisplay types={[m.type.name]} compact />
                    <span className="flex-1 capitalize">{getMoveDisplayName(m)}</span>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-subtle tabular-nums">
                      <span className="w-14 text-right">Att: {m.power ?? '—'}</span>
                      <span className="w-14 text-right">Acc: {m.accuracy ?? '—'}</span>
                      <span className="w-10 text-right">PP {m.pp ?? '—'}</span>
                    </div>
                  </div>
                  {description && (
                    <p className="mt-0.5 pl-7 text-xs text-subtle italic line-clamp-2">
                      {description}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
