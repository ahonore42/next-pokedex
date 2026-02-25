'use client';

import React, { useState } from 'react';
import Sprite from '~/components/ui/Sprite';
import TypeBadgesDisplay from '~/components/pokemon-types/TypeBadgesDisplay';
import Icon from '~/components/ui/icons';
import { capitalizeName } from '~/utils/text';
import type { TeamMember } from './types';
import { getActiveSprite } from './types';
import { formatShowdownExport } from '~/utils/showdown-export';

interface SlotCardProps {
  index: number;
  member: TeamMember | null;
  isActive: boolean;
  onSelect: () => void;
  onClear: () => void;
}

export default function SlotCard({ index, member, isActive, onSelect, onClear }: SlotCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!member) return;
    void navigator.clipboard.writeText(formatShowdownExport(member)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      aria-label={member ? `Edit slot ${index + 1}: ${member.pokemonName}` : `Add Pokémon to slot ${index + 1}`}
      className={[
        'relative cursor-pointer rounded-lg border-2 p-2 select-none transition-all duration-200',
        'flex flex-col items-center gap-1 min-h-32',
        isActive
          ? 'border-indigo-500 dark:border-indigo-400 shadow-md bg-indigo-50 dark:bg-indigo-900/20'
          : 'border-border hover:border-indigo-300 dark:hover:border-indigo-600',
        !member ? 'border-dashed' : '',
      ].join(' ')}
    >
      {member ? (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-surface hover:bg-red-100 dark:hover:bg-red-900/40 text-subtle hover:text-red-500 text-xs flex items-center justify-center leading-none"
            aria-label="Remove Pokémon"
          >
            ×
          </button>
          <button
            onClick={handleCopy}
            className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-surface hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-subtle hover:text-indigo-500 flex items-center justify-center"
            aria-label="Copy Showdown export to clipboard"
            title="Copy Showdown export"
          >
            {copied ? <Icon type="check" size="sm" /> : <Icon type="copy" size="sm" />}
          </button>
          <Sprite src={getActiveSprite(member.sprites, member.gender, member.shiny) ?? undefined} alt={member.pokemonName} variant="xs" />
          <p className="text-xs font-semibold text-primary capitalize text-center leading-tight truncate w-full px-1">
            {capitalizeName(member.pokemonName)}
          </p>
          <TypeBadgesDisplay types={member.types} compact />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 text-subtle gap-1">
          <span className="text-3xl font-light">+</span>
          <span className="text-xs">Slot {index + 1}</span>
        </div>
      )}
    </div>
  );
}
