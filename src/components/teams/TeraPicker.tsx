'use client';

import React, { useState, useRef, useEffect } from 'react';
import { pokemonTypes } from '~/utils/pokemon-types';
import { getTypeColor, truncateTypeName } from '~/utils';
import type { PokemonTypeName } from '~/server/routers/_app';

// All valid Tera Types: the 18 standard types + Stellar
const TERA_TYPES: string[] = [...pokemonTypes, 'stellar'];

interface TeraPickerProps {
  value: string | null;
  onChange: (type: string) => void;
}

export default function TeraPicker({ value, onChange }: TeraPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const currentColor = value ? getTypeColor(value) : undefined;

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold text-primary uppercase tracking-wide mb-2">
        Tera Type
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-left flex items-center gap-2 focus:outline-none focus:border-indigo-400 hover:border-indigo-400 transition-colors"
      >
        {value ? (
          <>
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: currentColor }}
            />
            <span className="text-primary capitalize">{value}</span>
          </>
        ) : (
          <span className="text-subtle">— Select type —</span>
        )}
      </button>

      {open && (
        <div className="absolute z-20 top-full left-0 mt-1 p-2 bg-background border border-border rounded-lg shadow-lg">
          <div className="grid grid-cols-4 gap-1">
            {TERA_TYPES.map((t) => {
              const color = getTypeColor(t);
              const isSelected = value === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onChange(t);
                    setOpen(false);
                  }}
                  className={[
                    'py-1 rounded text-xs font-bold text-white transition-opacity',
                    isSelected
                      ? 'ring-2 ring-white ring-offset-1 ring-offset-background opacity-100'
                      : 'opacity-75 hover:opacity-100',
                  ].join(' ')}
                  style={{ backgroundColor: color }}
                  title={t.charAt(0).toUpperCase() + t.slice(1)}
                >
                  {truncateTypeName(t as PokemonTypeName, 'short')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
