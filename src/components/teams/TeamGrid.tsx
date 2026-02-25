'use client';

import React from 'react';
import SlotCard from './SlotCard';
import type { TeamMember } from './types';

interface TeamGridProps {
  team: (TeamMember | null)[];
  activeSlot: number | null;
  onSelectSlot: (index: number) => void;
  onClearSlot: (index: number) => void;
}

export default function TeamGrid({ team, activeSlot, onSelectSlot, onClearSlot }: TeamGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {team.map((member, i) => (
        <SlotCard
          key={i}
          index={i}
          member={member}
          isActive={activeSlot === i}
          onSelect={() => onSelectSlot(i)}
          onClear={() => onClearSlot(i)}
        />
      ))}
    </div>
  );
}
