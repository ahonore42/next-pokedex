'use client';

import React from 'react';
import type { PokemonListAbility } from '~/lib/types/pokemon';
import { capitalizeName } from '~/utils/text';

interface AbilityPickerProps {
  abilities: PokemonListAbility[];
  selected: PokemonListAbility | null;
  onChange: (ability: PokemonListAbility) => void;
}

export default function AbilityPicker({ abilities, selected, onChange }: AbilityPickerProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-primary uppercase tracking-wide mb-2">
        Ability
      </label>
      <div className="flex flex-wrap gap-2">
        {abilities.map((entry) => {
          const name = entry.ability.names[0]?.name ?? capitalizeName(entry.ability.name);
          const isSelected = selected?.ability.id === entry.ability.id;
          return (
            <button
              key={entry.ability.id}
              onClick={() => onChange(entry)}
              className={[
                'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                isSelected
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white border-indigo-600'
                  : 'border-border bg-surface hover:border-indigo-300 text-primary',
              ].join(' ')}
            >
              {name}
              {entry.isHidden && (
                <span className={`ml-1.5 text-xs font-normal ${isSelected ? 'text-indigo-200' : 'text-subtle'}`}>
                  Hidden
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
