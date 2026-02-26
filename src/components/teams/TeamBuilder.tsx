'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { PokemonListData, PokemonListAbility } from '~/lib/types/pokemon';
import TeamGrid from './TeamGrid';
import SlotEditor from './SlotEditor';
import GenerationFilter from './GenerationFilter';
import ImportExportButtons from './ImportExportButtons';
import TeamTypeWeaknesses from './TeamTypeWeaknesses';
import type { TeamMember, TeamMove, TeamItem, StatValues, TeamGender } from './types';
import {
  listStatsToStatValues,
  spritesToTeamSprites,
  getDefaultGender,
  DEFAULT_IVS,
  DEFAULT_EVS,
  DEFAULT_DVS,
  DEFAULT_GEN12_EVS,
  DEFAULT_LEVEL,
} from './types';
import { getGenFeatures } from '~/utils/generation-rules';
import { isSpecialForm } from '~/utils/mega-requirements';
import { parsePokePaste, exportTeamToPokePaste, normalizeForLookup } from '~/utils/pokepaste';
import { usePokemonCache } from '~/lib/contexts/PokedexCacheContext';

const STAT_KEYS: (keyof StatValues)[] = [
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
];

export default function TeamBuilder() {
  const [team, setTeam] = useState<(TeamMember | null)[]>(Array(6).fill(null));
  const [activeSlot, setActiveSlot] = useState<number | null>(0);
  const [generation, setGeneration] = useState(9);

  const { getPokemonByGeneration, ensureCacheLoaded } = usePokemonCache();

  useEffect(() => { ensureCacheLoaded(); }, [ensureCacheLoaded]);

  const usedSpeciesIds = useMemo(
    () => new Set(team.filter(Boolean).map((m) => m!.speciesId)),
    [team],
  );

  // True when any OTHER slot already has a mega/primal/gmax form (depending on generation)
  const hasMegaElsewhere = useMemo(
    () =>
      activeSlot === null
        ? false
        : team.some((m, i) => i !== activeSlot && m != null && isSpecialForm(m.pokemonName, generation)),
    [team, activeSlot, generation],
  );

  const handleGenerationChange = useCallback((gen: number) => {
    setGeneration(gen);
    setTeam(Array(6).fill(null));
    setActiveSlot(0);
  }, []);

  const updateSlot = useCallback((index: number, updater: (m: TeamMember) => TeamMember) => {
    setTeam((prev) => prev.map((m, i) => (i === index && m ? updater(m) : m)));
  }, []);

  const selectPokemon = useCallback(
    (slotIndex: number, pokemon: PokemonListData) => {
      const features = getGenFeatures(generation);
      const defaultIvs = features.ivMax === 15 ? DEFAULT_DVS : DEFAULT_IVS;
      const defaultEvs = features.ivMax === 15 ? DEFAULT_GEN12_EVS : DEFAULT_EVS;
      setTeam((prev) =>
        prev.map((m, i) => {
          if (i !== slotIndex) return m;
          const sameSpecies = m?.speciesId === pokemon.speciesId;
          const baseStats = listStatsToStatValues(pokemon.stats);
          const sprites = spritesToTeamSprites(pokemon.sprites);
          const defaultGender = features.hasGender ? getDefaultGender(pokemon.genderRate) : null;
          const defaultTeraType = features.hasTera ? (pokemon.types[0] ?? null) : null;
          return {
            pokemonId: pokemon.pokemonId,
            speciesId: pokemon.speciesId,
            pokemonName: pokemon.name,
            sprites,
            genderRate: pokemon.genderRate,
            gender: sameSpecies ? (m?.gender ?? defaultGender) : defaultGender,
            shiny: sameSpecies ? (m?.shiny ?? false) : false,
            types: pokemon.types,
            abilities: pokemon.abilities,
            ability: sameSpecies ? (m?.ability ?? pokemon.abilities[0] ?? null) : (pokemon.abilities[0] ?? null),
            nature: m?.nature ?? 'hardy',
            item: sameSpecies ? (m?.item ?? null) : null,
            moves: sameSpecies ? (m?.moves ?? [null, null, null, null]) : [null, null, null, null],
            baseStats,
            ivs: sameSpecies ? (m?.ivs ?? { ...defaultIvs }) : { ...defaultIvs },
            evs: sameSpecies ? (m?.evs ?? { ...defaultEvs }) : { ...defaultEvs },
            level: m?.level ?? DEFAULT_LEVEL,
            teraType: sameSpecies ? (m?.teraType ?? defaultTeraType) : defaultTeraType,
          };
        }),
      );
    },
    [generation],
  );

  const importTeam = useCallback(
    (text: string) => {
      const entries = parsePokePaste(text);
      const available = getPokemonByGeneration(generation);
      const features = getGenFeatures(generation);

      const newTeam: (TeamMember | null)[] = Array(6).fill(null);

      for (let i = 0; i < Math.min(entries.length, 6); i++) {
        const entry = entries[i];
        const normSpecies = normalizeForLookup(entry.speciesName);
        const pokemon = available.find((p) => normalizeForLookup(p.name) === normSpecies);
        if (!pokemon) continue;

        const baseStats = listStatsToStatValues(pokemon.stats);
        const sprites = spritesToTeamSprites(pokemon.sprites);
        const defaultGender = features.hasGender ? getDefaultGender(pokemon.genderRate) : null;
        const gender: TeamGender = entry.gender ?? defaultGender;

        // Match ability by display name
        let ability: PokemonListAbility | null = pokemon.abilities[0] ?? null;
        if (entry.abilityName) {
          const normAbility = normalizeForLookup(entry.abilityName);
          const matched = pokemon.abilities.find((a) => {
            const displayName = a.ability.names[0]?.name ?? a.ability.name;
            return normalizeForLookup(displayName) === normAbility;
          });
          if (matched) ability = matched;
        }

        // Clamp IVs to generation's max (handles Gen 1-2 DV max of 15)
        const ivs: StatValues = Object.fromEntries(
          STAT_KEYS.map((k) => [k, Math.min(entry.ivs[k], features.ivMax)]),
        ) as StatValues;

        const level: 50 | 100 = entry.level === 50 ? 50 : 100;

        const defaultTeraType = features.hasTera ? (pokemon.types[0] ?? null) : null;
        newTeam[i] = {
          pokemonId: pokemon.pokemonId,
          speciesId: pokemon.speciesId,
          pokemonName: pokemon.name,
          sprites,
          genderRate: pokemon.genderRate,
          gender,
          shiny: entry.shiny,
          types: pokemon.types,
          abilities: pokemon.abilities,
          ability,
          nature: entry.nature ?? 'hardy',
          item: null,
          moves: [null, null, null, null],
          baseStats,
          ivs,
          evs: entry.evs,
          level,
          teraType: entry.teraType ?? defaultTeraType,
          ...(entry.moveNames.length > 0 ? { pendingMoveNames: entry.moveNames } : {}),
          ...(entry.itemName ? { pendingItemName: entry.itemName } : {}),
        };
      }

      setTeam(newTeam);
      setActiveSlot(0);
    },
    [generation, getPokemonByGeneration],
  );

  const clearSlot = useCallback((index: number) => {
    setTeam((prev) => prev.map((m, i) => (i === index ? null : m)));
  }, []);

  const handleSelectSlot = useCallback((index: number) => {
    setActiveSlot((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <GenerationFilter value={generation} onChange={handleGenerationChange} />
        <ImportExportButtons
          onImport={importTeam}
          teamHasMembers={team.some(Boolean)}
          getExportText={() => exportTeamToPokePaste(team)}
        />
      </div>

      <TeamGrid
        team={team}
        activeSlot={activeSlot}
        onSelectSlot={handleSelectSlot}
        onClearSlot={clearSlot}
      />

      <TeamTypeWeaknesses team={team} />

      {activeSlot !== null && (
        <SlotEditor
          slotIndex={activeSlot}
          member={team[activeSlot]}
          usedSpeciesIds={usedSpeciesIds}
          hasMegaElsewhere={hasMegaElsewhere}
          generation={generation}
          onSelectPokemon={(p: PokemonListData) => selectPokemon(activeSlot, p)}
          onSetAbility={(ability: PokemonListAbility) =>
            updateSlot(activeSlot, (m) => ({ ...m, ability }))
          }
          onSetNature={(nature: string) => updateSlot(activeSlot, (m) => ({ ...m, nature }))}
          onSetItem={(item: TeamItem | null) => updateSlot(activeSlot, (m) => ({ ...m, item }))}
          onSetMove={(moveIndex: number, move: TeamMove | null) =>
            updateSlot(activeSlot, (m) => {
              const moves = [...m.moves] as (TeamMove | null)[];
              moves[moveIndex] = move;
              return { ...m, moves };
            })
          }
          onSetGender={(gender: TeamGender) => updateSlot(activeSlot, (m) => ({ ...m, gender }))}
          onSetShiny={(shiny: boolean) => updateSlot(activeSlot, (m) => ({ ...m, shiny }))}
          onChangeIVs={(ivs: StatValues) => updateSlot(activeSlot, (m) => ({ ...m, ivs }))}
          onChangeEVs={(evs: StatValues) => updateSlot(activeSlot, (m) => ({ ...m, evs }))}
          onChangeLevel={(level: 50 | 100) => updateSlot(activeSlot, (m) => ({ ...m, level }))}
          onResolvePendingMoves={(moves) =>
            updateSlot(activeSlot, (m) => ({ ...m, moves, pendingMoveNames: undefined }))
          }
          onResolvePendingItem={(item) =>
            updateSlot(activeSlot, (m) => ({ ...m, item, pendingItemName: undefined }))
          }
          onSetTeraType={(teraType: string) =>
            updateSlot(activeSlot, (m) => ({ ...m, teraType }))
          }
        />
      )}
    </div>
  );
}
