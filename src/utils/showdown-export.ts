import type { TeamMember } from '~/components/teams/types';
import { getMoveDisplayName, getItemDisplayName } from '~/components/teams/types';
import { capitalizeName } from '~/utils/text';

// Stat order matches Showdown export convention
const STAT_KEYS = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'] as const;
type StatKey = (typeof STAT_KEYS)[number];

const STAT_ABBR: Record<StatKey, string> = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  specialAttack: 'SpA',
  specialDefense: 'SpD',
  speed: 'Spe',
};

function formatStatLine(
  values: Record<StatKey, number>,
  filter: (v: number) => boolean,
): string {
  return STAT_KEYS.filter((k) => filter(values[k]))
    .map((k) => `${values[k]} ${STAT_ABBR[k]}`)
    .join(' / ');
}

export function formatShowdownExport(member: TeamMember): string {
  const lines: string[] = [];

  // Line 1: Species (Gender) @ Item
  const name = capitalizeName(member.pokemonName);
  const genderStr = member.gender === 'male' ? ' (M)' : member.gender === 'female' ? ' (F)' : '';
  const itemPart = member.item ? ` @ ${getItemDisplayName(member.item)}` : '';
  lines.push(`${name}${genderStr}${itemPart}`);

  // Ability
  if (member.ability) {
    const abilityName =
      member.ability.ability.names[0]?.name ?? capitalizeName(member.ability.ability.name);
    lines.push(`Ability: ${abilityName}`);
  }

  // Level (omit if 100 — Showdown default)
  if (member.level !== 100) {
    lines.push(`Level: ${member.level}`);
  }

  // Shiny
  if (member.shiny) {
    lines.push('Shiny: Yes');
  }

  // Tera Type (Gen 9 only — omit if null)
  if (member.teraType) {
    const tera = member.teraType.charAt(0).toUpperCase() + member.teraType.slice(1);
    lines.push(`Tera Type: ${tera}`);
  }

  // EVs (omit stats that are 0)
  const evStr = formatStatLine(member.evs as Record<StatKey, number>, (v) => v > 0);
  if (evStr) lines.push(`EVs: ${evStr}`);

  // Nature
  if (member.nature) {
    lines.push(`${capitalizeName(member.nature)} Nature`);
  }

  // IVs (omit stats that are 31 — Showdown default)
  const ivStr = formatStatLine(member.ivs as Record<StatKey, number>, (v) => v < 31);
  if (ivStr) lines.push(`IVs: ${ivStr}`);

  // Moves
  for (const move of member.moves) {
    if (move) lines.push(`- ${getMoveDisplayName(move)}`);
  }

  return lines.join('\n');
}
