'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { trpc } from '~/utils/trpc';
import { usePokemonCache } from '~/lib/contexts/PokedexCacheContext';
import type { PokemonListData, PokemonListAbility } from '~/lib/types/pokemon';
import Sprite from '~/components/ui/Sprite';
import TypeBadgesDisplay from '~/components/pokemon-types/TypeBadgesDisplay';
import SearchBar from '~/components/ui/searchbars/SearchBar';
import { capitalizeName } from '~/utils/text';
import AbilityPicker from './AbilityPicker';
import NaturePicker from './NaturePicker';
import ItemPicker from './ItemPicker';
import MoveSlot from './MoveSlot';
import StatsEditor from './StatsEditor';
import GenderPicker from './GenderPicker';
import TeraPicker from './TeraPicker';
import type { TeamMember, TeamMove, TeamItem, StatValues, TeamGender } from './types';
import { getActiveSprite, getMoveDisplayName, getItemDisplayName } from './types';
import { normalizeForLookup } from '~/utils/pokepaste';
import {
  isMegaForm,
  isGmaxForm,
  isSpecialForm,
  getMegaRequiredItem,
  MEGA_AVAILABLE_GENS,
  GMAX_AVAILABLE_GEN,
} from '~/utils/mega-requirements';
import { getGenFeatures } from '~/utils/generation-rules';

const pokemonFilter = (p: PokemonListData, q: string) =>
  p.name.toLowerCase().includes(q.toLowerCase());

interface SlotEditorProps {
  slotIndex: number;
  member: TeamMember | null;
  usedSpeciesIds: Set<number>;
  hasMegaElsewhere: boolean;
  generation: number;
  onSelectPokemon: (p: PokemonListData) => void;
  onSetAbility: (ability: PokemonListAbility) => void;
  onSetNature: (nature: string) => void;
  onSetItem: (item: TeamItem | null) => void;
  onSetMove: (moveIndex: number, move: TeamMove | null) => void;
  onSetGender: (gender: TeamGender) => void;
  onSetShiny: (shiny: boolean) => void;
  onChangeIVs: (ivs: StatValues) => void;
  onChangeEVs: (evs: StatValues) => void;
  onChangeLevel: (level: 50 | 100) => void;
  onResolvePendingMoves: (moves: (TeamMove | null)[]) => void;
  onResolvePendingItem: (item: TeamItem | null) => void;
  onSetTeraType: (teraType: string) => void;
}

export default function SlotEditor({
  slotIndex,
  member,
  usedSpeciesIds,
  hasMegaElsewhere,
  generation,
  onSelectPokemon,
  onSetAbility,
  onSetNature,
  onSetItem,
  onSetMove,
  onSetGender,
  onSetShiny,
  onChangeIVs,
  onChangeEVs,
  onChangeLevel,
  onResolvePendingMoves,
  onResolvePendingItem,
  onSetTeraType,
}: SlotEditorProps) {
  const { getPokemonByGeneration } = usePokemonCache();
  const availablePokemon = useMemo(() => {
    const megaAllowed = MEGA_AVAILABLE_GENS.has(generation);
    const gmaxAllowed = generation === GMAX_AVAILABLE_GEN;
    return getPokemonByGeneration(generation).filter((p) => {
      if (isMegaForm(p.name) && !megaAllowed) return false;
      if (isGmaxForm(p.name) && !gmaxAllowed) return false;
      return true;
    });
  }, [getPokemonByGeneration, generation]);

  const features = getGenFeatures(generation);

  const { data: moveset = [], isLoading: movesetLoading } = trpc.pokemon.moveset.useQuery(
    { pokemonId: member?.pokemonId ?? 0, generationId: generation },
    { enabled: !!member?.pokemonId, staleTime: 60_000 },
  );

  const { data: holdableItems = [] } = trpc.items.holdable.useQuery(
    { generationId: generation },
    { enabled: features.hasHeldItems, staleTime: 60_000 },
  );

  // Auto-assign required mega stone / primal orb whenever the form or item list changes
  useEffect(() => {
    if (!member || !holdableItems.length) return;
    const requiredName = getMegaRequiredItem(member.pokemonName);
    if (!requiredName) return;
    if (member.item?.name === requiredName) return;
    const item = holdableItems.find((i) => i.name === requiredName) ?? null;
    if (item) onSetItem(item);
  }, [member?.pokemonName, holdableItems]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rayquaza-mega: cannot hold any item; slot 0 must be Dragon Ascent
  useEffect(() => {
    if (!member || member.pokemonName !== 'rayquaza-mega') return;
    if (member.item !== null) onSetItem(null);
    if (!moveset.length) return;
    const dragonAscent = moveset.find((m) => m.name === 'dragon-ascent');
    if (!dragonAscent) return;
    if (member.moves[0]?.id === dragonAscent.id) return;
    onSetMove(0, dragonAscent);
  }, [member?.pokemonName, moveset]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resolve pending move names from an imported PokePaste when the moveset loads
  useEffect(() => {
    if (!member?.pendingMoveNames?.length || !moveset.length) return;
    const resolved = member.pendingMoveNames.map((name) => {
      const norm = normalizeForLookup(name);
      return (
        moveset.find(
          (m) =>
            normalizeForLookup(getMoveDisplayName(m)) === norm ||
            normalizeForLookup(m.name) === norm,
        ) ?? null
      );
    });
    while (resolved.length < 4) resolved.push(null);
    onResolvePendingMoves(resolved.slice(0, 4));
  }, [moveset, member?.pendingMoveNames]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resolve pending item name from an imported PokePaste when holdable items load
  useEffect(() => {
    if (!member?.pendingItemName || !holdableItems.length) return;
    const norm = normalizeForLookup(member.pendingItemName);
    const resolved =
      holdableItems.find(
        (i) =>
          normalizeForLookup(getItemDisplayName(i)) === norm ||
          normalizeForLookup(i.name) === norm,
      ) ?? null;
    onResolvePendingItem(resolved);
  }, [holdableItems, member?.pendingItemName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock item picker for any mega/primal form (includes Rayquaza-mega which cannot hold anything)
  const isMegaItem = member ? isMegaForm(member.pokemonName) : false;

  const usedMoveIds = useMemo(
    () => new Set(member?.moves.filter(Boolean).map((m) => m!.id) ?? []),
    [member?.moves],
  );

  // Derive the sprite URL to display based on gender + shiny state
  const activeSprite = member ? getActiveSprite(member.sprites, member.gender, member.shiny) : null;

  const renderPokemonResult = useCallback(
    (pokemon: PokemonListData, onResultClick: () => void) => {
      const isDuplicate =
        usedSpeciesIds.has(pokemon.speciesId) && pokemon.speciesId !== member?.speciesId;
      const isSpecialBlocked = hasMegaElsewhere && isSpecialForm(pokemon.name, generation);
      const isDisabled = isDuplicate || isSpecialBlocked;
      return (
        <button
          key={pokemon.pokemonId}
          disabled={isDisabled}
          onClick={() => {
            if (isDisabled) return;
            onResultClick();
            onSelectPokemon(pokemon);
          }}
          className={[
            'w-full flex items-center gap-3 px-3 py-2 border-b border-border last:border-0 text-left transition-colors',
            isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-hover cursor-pointer',
          ].join(' ')}
        >
          <Sprite src={pokemon.sprites.frontDefault ?? undefined} alt={pokemon.name} variant="xs" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary capitalize">
              {capitalizeName(pokemon.name)}
            </p>
            <TypeBadgesDisplay types={pokemon.types} compact />
          </div>
          {isDuplicate && <span className="text-xs text-subtle shrink-0">on team</span>}
          {isSpecialBlocked && (
            <span className="text-xs text-subtle shrink-0">
              {generation === GMAX_AVAILABLE_GEN ? 'gmax used' : 'mega used'}
            </span>
          )}
        </button>
      );
    },
    [usedSpeciesIds, member?.speciesId, onSelectPokemon, hasMegaElsewhere, generation],
  );

  return (
    <div className="border border-border rounded-xl p-5 bg-surface-elevated space-y-5">
      {/* Header row: title + search bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-base font-semibold text-primary shrink-0">Pokémon {slotIndex + 1}</h3>

        <div className="">
          <SearchBar
            data={availablePokemon}
            filterFunction={pokemonFilter}
            placeholder={'Search Pokémon…'}
            renderResult={renderPokemonResult}
            limit={30}
            scroll
            resultsClassName="max-h-52"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 w-full">
        {member && (
          <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border w-full flex-1">
            <Sprite src={activeSprite ?? undefined} alt={member.pokemonName} variant="xs" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-primary capitalize">
                {capitalizeName(member.pokemonName)}
                {member.shiny && <span className="ml-1.5 text-xs text-yellow-400">✦ Shiny</span>}
              </p>
              <TypeBadgesDisplay types={member.types} />
            </div>

            {/* Gender + Shiny — opposite side from sprite, Gen 2+ only */}
            {features.hasGender && (
              <div className="flex items-center gap-2 shrink-0">
                <GenderPicker
                  genderRate={member.genderRate}
                  value={member.gender}
                  onChange={onSetGender}
                />
                {features.hasShiny && (
                  <button
                    type="button"
                    onClick={() => onSetShiny(!member.shiny)}
                    className={[
                      'flex items-center justify-center gap-1 px-2 py-0.5 rounded border text-xs font-medium transition-colors text-nowrap',
                      member.shiny
                        ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                        : 'bg-surface border-border text-subtle hover:border-yellow-400 hover:text-yellow-400',
                    ].join(' ')}
                    aria-pressed={member.shiny}
                  >
                    ✦ Shiny
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {member && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column: ability + nature/item + moves */}
            <div className="flex flex-col gap-3">
              {features.hasAbilities && (
                <AbilityPicker
                  abilities={member.abilities}
                  selected={member.ability}
                  onChange={onSetAbility}
                />
              )}

              {/* Nature + item row — only show if at least one is available */}
              {(features.hasNatures || features.hasHeldItems) && (
                <div className="grid grid-cols-2 gap-4">
                  {features.hasNatures && (
                    <NaturePicker value={member.nature} onChange={onSetNature} />
                  )}
                  {features.hasHeldItems && (
                    <ItemPicker
                      selected={member.item}
                      items={holdableItems}
                      onChange={onSetItem}
                      locked={isMegaItem}
                    />
                  )}
                </div>
              )}

              {/* Tera Type — Gen 9 only */}
              {features.hasTera && (
                <TeraPicker value={member.teraType} onChange={onSetTeraType} />
              )}

              {/* Moves */}
              <div>
                <label className="block text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                  Moves
                  {movesetLoading && (
                    <span className="ml-2 font-normal normal-case text-subtle">Loading…</span>
                  )}
                </label>
                {moveset.length === 0 && !movesetLoading ? (
                  <p className="text-sm text-subtle italic">No moves available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {member.moves.map((move, i) => (
                      <MoveSlot
                        key={i}
                        slotIndex={i}
                        move={move}
                        allMoves={moveset}
                        usedMoveIds={usedMoveIds}
                        onChange={(m) => onSetMove(i, m)}
                        locked={member.pokemonName === 'rayquaza-mega' && i === 0}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <StatsEditor
              baseStats={member.baseStats}
              ivs={member.ivs}
              evs={member.evs}
              level={member.level}
              natureName={member.nature}
              generation={generation}
              onChangeIVs={onChangeIVs}
              onChangeEVs={onChangeEVs}
              onChangeLevel={onChangeLevel}
            />
          </div>
        </>
      )}
    </div>
  );
}
