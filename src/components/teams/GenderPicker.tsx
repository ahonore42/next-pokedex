'use client';

import React from 'react';
import type { TeamGender } from './types';

interface GenderPickerProps {
  genderRate: number;
  value: TeamGender;
  onChange: (gender: TeamGender) => void;
}

/**
 * genderRate encoding (PokeAPI):
 *  -1 = genderless
 *   0 = male only
 *   8 = female only
 * 1–7 = both genders (selector shown)
 */
export default function GenderPicker({ genderRate, value, onChange }: GenderPickerProps) {
  if (genderRate === -1) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Gender</span>
        <span className="text-xs text-subtle">--</span>
      </div>
    );
  }

  if (genderRate === 0) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Gender</span>
        <span className="text-sm text-blue-400" title="Male only">♂</span>
      </div>
    );
  }

  if (genderRate === 8) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Gender</span>
        <span className="text-sm text-pink-400" title="Female only">♀</span>
      </div>
    );
  }

  // Both genders — show toggle
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-semibold text-primary uppercase tracking-wide">Gender</span>
      <div className="flex rounded border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => onChange('male')}
          className={[
            'px-2 py-0.5 text-sm transition-colors',
            value === 'male'
              ? 'bg-blue-500 text-white'
              : 'bg-surface text-subtle hover:bg-hover',
          ].join(' ')}
          aria-pressed={value === 'male'}
          title="Male"
        >
          ♂
        </button>
        <button
          type="button"
          onClick={() => onChange('female')}
          className={[
            'px-2 py-0.5 text-sm transition-colors border-l border-border',
            value === 'female'
              ? 'bg-pink-500 text-white'
              : 'bg-surface text-subtle hover:bg-hover',
          ].join(' ')}
          aria-pressed={value === 'female'}
          title="Female"
        >
          ♀
        </button>
      </div>
    </div>
  );
}
