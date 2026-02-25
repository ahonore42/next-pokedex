'use client';

import React from 'react';
import { NATURES } from '~/utils/natures';

interface NaturePickerProps {
  value: string | null;
  onChange: (nature: string) => void;
}

export default function NaturePicker({ value, onChange }: NaturePickerProps) {

  return (
    <div>
      <label className="block text-xs font-semibold text-primary uppercase tracking-wide mb-2">
        Nature
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-primary focus:outline-none focus:border-indigo-400 appearance-none"
      >
        <option value="">— Select nature —</option>
        {NATURES.map((n) => (
          <option key={n.name} value={n.name}>
            {n.displayName}
            {n.increased ? ` (+${n.increased} / -${n.decreased})` : ' (neutral)'}
          </option>
        ))}
      </select>
    </div>
  );
}
