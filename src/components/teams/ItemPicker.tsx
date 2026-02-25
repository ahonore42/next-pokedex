'use client';

import React, { useState, useMemo } from 'react';
import type { TeamItem } from './types';
import { getItemDisplayName } from './types';

interface ItemPickerProps {
  selected: TeamItem | null;
  items: TeamItem[];
  onChange: (item: TeamItem | null) => void;
  locked?: boolean;
}

export default function ItemPicker({ selected, items, onChange, locked = false }: ItemPickerProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () => items.filter((item) => getItemDisplayName(item).toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  const select = (item: TeamItem) => {
    onChange(item);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-primary uppercase tracking-wide mb-2">
        Held Item
      </label>
      <button
        onClick={() => !locked && setOpen((v) => !v)}
        className={[
          'w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-left transition-colors',
          locked ? 'cursor-default opacity-80' : 'hover:border-indigo-300',
        ].join(' ')}
      >
        {selected ? (
          <>
            {selected.sprite && (
              <img src={selected.sprite} alt="" className="w-5 h-5 shrink-0" />
            )}
            <span className="flex-1 text-primary capitalize">{getItemDisplayName(selected)}</span>
            {locked ? (
              <span className="text-xs text-subtle" title="Required for this form">🔒</span>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onChange(null); }}
                className="text-subtle hover:text-red-500 text-xs"
                aria-label="Remove held item"
              >
                ×
              </button>
            )}
          </>
        ) : (
          <span className="text-subtle">— No item —</span>
        )}
      </button>

      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto">
          <div className="p-2 border-b border-border sticky top-0 bg-background">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items…"
              className="w-full px-2 py-1 text-sm rounded border border-border bg-surface focus:outline-none focus:border-indigo-400"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="p-3 text-sm text-subtle text-center">No items found</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => select(item)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-hover text-sm border-b border-border last:border-0 text-left"
              >
                {item.sprite ? (
                  <img src={item.sprite} alt="" className="w-5 h-5 shrink-0" />
                ) : (
                  <span className="w-5 h-5 shrink-0" />
                )}
                <span className="capitalize">{getItemDisplayName(item)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
