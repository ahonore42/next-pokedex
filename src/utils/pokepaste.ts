import type { TeamMember } from '~/components/teams/types';
import { formatShowdownExport } from './showdown-export';
import type { StatValues } from './pokemon-stats';
import type { TeamGender } from '~/components/teams/types';

export interface PokePasteEntry {
  speciesName: string;
  nickname: string | null;
  gender: TeamGender;
  itemName: string | null;
  abilityName: string | null;
  level: number;
  shiny: boolean;
  teraType: string | null;
  evs: StatValues;
  ivs: StatValues;
  nature: string | null;
  moveNames: string[];
}

const STAT_ABBR_MAP: Record<string, keyof StatValues> = {
  hp: 'hp',
  atk: 'attack',
  def: 'defense',
  spa: 'specialAttack',
  spd: 'specialDefense',
  spe: 'speed',
};

function parseStatLine(line: string): Partial<StatValues> {
  const result: Partial<StatValues> = {};
  for (const part of line.split('/').map((s) => s.trim())) {
    const match = part.match(/^(\d+)\s+(\w+)$/);
    if (!match) continue;
    const key = STAT_ABBR_MAP[match[2].toLowerCase()];
    if (key) result[key] = parseInt(match[1], 10);
  }
  return result;
}

/**
 * Normalizes a Pokémon or item name for fuzzy matching:
 * lowercases and strips hyphens and spaces.
 */
export function normalizeForLookup(s: string): string {
  return s.toLowerCase().replace(/[-\s]+/g, '');
}

/**
 * Parses the first line of a PokePaste block.
 * Handles:
 *  - `Species @ Item`
 *  - `Species (M) @ Item`
 *  - `Nickname (Species) @ Item`
 *  - `Nickname (Species) (M) @ Item`
 */
function parseFirstLine(line: string): {
  speciesName: string;
  nickname: string | null;
  gender: TeamGender;
  itemName: string | null;
} {
  let rest = line;
  let itemName: string | null = null;

  const atIdx = rest.indexOf(' @ ');
  if (atIdx !== -1) {
    itemName = rest.slice(atIdx + 3).trim();
    rest = rest.slice(0, atIdx).trim();
  }

  let gender: TeamGender = null;
  const genderMatch = rest.match(/\s+\((M|F)\)$/);
  if (genderMatch) {
    gender = genderMatch[1] === 'M' ? 'male' : 'female';
    rest = rest.slice(0, rest.length - genderMatch[0].length).trim();
  }

  // Detect `Nickname (Species)` pattern — the last parenthetical group
  const parenMatch = rest.match(/^(.*)\(([^)]+)\)$/);
  if (parenMatch && parenMatch[1].trim().length > 0) {
    return {
      speciesName: parenMatch[2].trim(),
      nickname: parenMatch[1].trim(),
      gender,
      itemName,
    };
  }

  return { speciesName: rest.trim(), nickname: null, gender, itemName };
}

const ZERO_STATS: StatValues = {
  hp: 0,
  attack: 0,
  defense: 0,
  specialAttack: 0,
  specialDefense: 0,
  speed: 0,
};

const MAX_IV_STATS: StatValues = {
  hp: 31,
  attack: 31,
  defense: 31,
  specialAttack: 31,
  specialDefense: 31,
  speed: 31,
};

/**
 * Parses a single PokePaste / Showdown export block into a structured entry.
 * EVs default to 0 for unlisted stats; IVs default to 31 for unlisted stats.
 */
export function parsePokePasteBlock(block: string): PokePasteEntry | null {
  const lines = block
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return null;

  const { speciesName, nickname, gender, itemName } = parseFirstLine(lines[0]);
  if (!speciesName) return null;

  let abilityName: string | null = null;
  let level = 100;
  let shiny = false;
  let teraType: string | null = null;
  const evs: StatValues = { ...ZERO_STATS };
  const ivs: StatValues = { ...MAX_IV_STATS };
  let nature: string | null = null;
  const moveNames: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('Ability: ')) {
      abilityName = l.slice('Ability: '.length).trim();
    } else if (l.startsWith('Level: ')) {
      level = parseInt(l.slice('Level: '.length).trim(), 10) || 100;
    } else if (l === 'Shiny: Yes') {
      shiny = true;
    } else if (l.startsWith('Tera Type: ')) {
      teraType = l.slice('Tera Type: '.length).trim().toLowerCase();
    } else if (l.startsWith('EVs: ')) {
      Object.assign(evs, parseStatLine(l.slice('EVs: '.length)));
    } else if (l.startsWith('IVs: ')) {
      Object.assign(ivs, parseStatLine(l.slice('IVs: '.length)));
    } else if (l.endsWith(' Nature')) {
      nature = l.slice(0, l.length - ' Nature'.length).trim().toLowerCase();
    } else if (l.startsWith('- ')) {
      moveNames.push(l.slice(2).trim());
    }
  }

  return { speciesName, nickname, gender, itemName, abilityName, level, shiny, teraType, evs, ivs, nature, moveNames };
}

/**
 * Parses a full PokePaste text (multiple blocks separated by blank lines).
 */
export function parsePokePaste(text: string): PokePasteEntry[] {
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map(parsePokePasteBlock)
    .filter((e): e is PokePasteEntry => e !== null);
}

/**
 * Exports a team to PokePaste / Showdown format.
 */
export function exportTeamToPokePaste(members: (TeamMember | null)[]): string {
  return members
    .filter((m): m is TeamMember => m !== null)
    .map(formatShowdownExport)
    .join('\n\n');
}
