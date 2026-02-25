'use client';

import React, { useMemo } from 'react';
import { trpc } from '~/utils/trpc';
import { buildTypeEfficacyMap, getTypeEfficacy, pokemonTypes } from '~/utils/pokemon-types';
import TypeBadge from '~/components/pokemon-types/TypeBadge';
import type { TeamMember } from './types';

interface TeamTypeWeaknessesProps {
  team: (TeamMember | null)[];
}

export default function TeamTypeWeaknesses({ team }: TeamTypeWeaknessesProps) {
  const { data: efficacies } = trpc.types.getAllTypeEfficacies.useQuery(undefined, {
    staleTime: Infinity,
  });

  const activeMembers = useMemo(
    () => team.filter((m): m is TeamMember => m !== null),
    [team],
  );

  const unresistedWeaknesses = useMemo(() => {
    if (!efficacies || !activeMembers.length) return [];
    const map = buildTypeEfficacyMap(efficacies);

    return pokemonTypes.filter((attackingType) => {
      let anyWeak = false;
      let anyResists = false;

      for (const member of activeMembers) {
        let mult = 1;
        for (const defType of member.types) {
          mult *= getTypeEfficacy(map, attackingType, defType);
        }
        if (mult >= 2) anyWeak = true;
        if (mult <= 0.5) anyResists = true;
      }

      return anyWeak && !anyResists;
    });
  }, [activeMembers, efficacies]);

  if (!activeMembers.length) return null;

  return (
    <div className="border border-border rounded-xl p-5 bg-surface-elevated">
      <h3 className="text-base font-semibold text-primary mb-3">Unresisted Weaknesses</h3>
      {!efficacies ? (
        <p className="text-sm text-subtle">Loading…</p>
      ) : unresistedWeaknesses.length === 0 ? (
        <p className="text-sm text-green-500">No unresisted weaknesses — great coverage!</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {unresistedWeaknesses.map((type) => (
            <TypeBadge key={type} type={type} link={false} />
          ))}
        </div>
      )}
    </div>
  );
}
