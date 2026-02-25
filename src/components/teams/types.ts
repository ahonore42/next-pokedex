import type { MovesetMove, HoldableItem } from '~/server/routers/_app';
import type { PokemonListAbility, PokemonListStat, PokemonListSprites } from '~/lib/types/pokemon';
import { capitalizeName } from '~/utils/text';
import { type StatValues, statNames } from '~/utils/pokemon-stats';

export type { StatValues };

export type TeamMove = MovesetMove;
export type TeamItem = HoldableItem;

export type TeamSprites = {
  frontDefault: string | null;
  frontShiny: string | null;
  frontFemale: string | null;
  frontShinyFemale: string | null;
};

export type TeamGender = 'male' | 'female' | null;

export type TeamMember = {
  pokemonId: number;
  speciesId: number;
  pokemonName: string;
  sprites: TeamSprites;
  genderRate: number;
  gender: TeamGender;
  shiny: boolean;
  types: string[];
  abilities: PokemonListAbility[];
  ability: PokemonListAbility | null;
  nature: string | null;
  item: TeamItem | null;
  moves: (TeamMove | null)[];
  baseStats: StatValues;
  ivs: StatValues;
  evs: StatValues;
  level: 50 | 100;
  teraType: string | null;
  pendingMoveNames?: string[];
  pendingItemName?: string;
};

/**
 * Returns the appropriate sprite URL for a member based on their gender and shiny state.
 * Falls back gracefully when gendered/shiny sprites are absent.
 */
export function getActiveSprite(sprites: TeamSprites, gender: TeamGender, shiny: boolean): string | null {
  if (gender === 'female') {
    if (shiny && sprites.frontShinyFemale) return sprites.frontShinyFemale;
    if (sprites.frontFemale) return sprites.frontFemale;
  }
  if (shiny && sprites.frontShiny) return sprites.frontShiny;
  return sprites.frontDefault;
}

/**
 * Derives the default gender for a Pokémon from its genderRate.
 * -1 = genderless, 0 = male-only, 8 = female-only, 1–7 = both (default male).
 */
export function getDefaultGender(genderRate: number): TeamGender {
  if (genderRate === -1) return null;
  if (genderRate === 8) return 'female';
  return 'male';
}

const STAT_NAME_MAP: Record<string, keyof StatValues> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  speed: 'speed',
};

export function listStatsToStatValues(stats: PokemonListStat[]): StatValues {
  const result = Object.fromEntries(statNames.map((k) => [k, 0])) as StatValues;
  for (const s of stats) {
    const key = STAT_NAME_MAP[s.stat.name];
    if (key) result[key] = s.baseStat;
  }
  return result;
}

export function spritesToTeamSprites(sprites: PokemonListSprites): TeamSprites {
  return {
    frontDefault: sprites.frontDefault ?? null,
    frontShiny: sprites.frontShiny ?? null,
    frontFemale: sprites.frontFemale ?? null,
    frontShinyFemale: sprites.frontShinyFemale ?? null,
  };
}

export const DEFAULT_IVS: StatValues = { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 };
export const DEFAULT_EVS: StatValues = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
export const DEFAULT_DVS: StatValues = { hp: 15, attack: 15, defense: 15, specialAttack: 15, specialDefense: 15, speed: 15 };
export const DEFAULT_GEN12_EVS: StatValues = { hp: 252, attack: 252, defense: 252, specialAttack: 252, specialDefense: 252, speed: 252 };
export const DEFAULT_LEVEL: 50 | 100 = 50;

export function getMoveDisplayName(move: MovesetMove): string {
  return move.names[0]?.name ?? capitalizeName(move.name);
}

export function getItemDisplayName(item: HoldableItem): string {
  return item.names[0]?.name ?? capitalizeName(item.name);
}
