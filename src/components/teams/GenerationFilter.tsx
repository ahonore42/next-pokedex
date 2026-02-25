'use client';

import React from 'react';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

interface GenerationFilterProps {
  value: number;
  onChange: (gen: number) => void;
}

export default function GenerationFilter({ value, onChange }: GenerationFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-primary uppercase tracking-wide shrink-0">
        Gen
      </span>
      {ROMAN.map((roman, idx) => {
        const gen = idx + 1;
        const isActive = value === gen;
        return (
          <button
            key={gen}
            type="button"
            onClick={() => onChange(gen)}
            className={[
              'px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
              isActive
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-surface border-border text-subtle hover:border-indigo-400 hover:text-primary',
            ].join(' ')}
            aria-pressed={isActive}
            aria-label={`Generation ${roman}`}
          >
            {roman}
          </button>
        );
      })}
    </div>
  );
}
