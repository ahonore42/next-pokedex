/**
 * Maps every mega/primal Pokémon form name (as used by PokéAPI) to the
 * PokeAPI item name of the stone or orb that is required for that form.
 *
 * Rayquaza-mega is intentionally omitted — it mega-evolves via Dragon Ascent,
 * not a held item.
 */
export const MEGA_REQUIRED_ITEMS: Record<string, string> = {
  // ── Gen 1 ──────────────────────────────────────────────────────────────────
  'venusaur-mega': 'venusaurite',
  'charizard-mega-x': 'charizardite-x',
  'charizard-mega-y': 'charizardite-y',
  'blastoise-mega': 'blastoisinite',
  'beedrill-mega': 'beedrillite',
  'pidgeot-mega': 'pidgeotite',
  'alakazam-mega': 'alakazite',
  'slowbro-mega': 'slowbronite',
  'gengar-mega': 'gengarite',
  'kangaskhan-mega': 'kangaskhanite',
  'pinsir-mega': 'pinsirite',
  'gyarados-mega': 'gyaradosite',
  'aerodactyl-mega': 'aerodactylite',
  'mewtwo-mega-x': 'mewtwonite-x',
  'mewtwo-mega-y': 'mewtwonite-y',

  // ── Gen 2 ──────────────────────────────────────────────────────────────────
  'ampharos-mega': 'ampharosite',
  'scizor-mega': 'scizorite',
  'heracross-mega': 'heracronite',
  'houndoom-mega': 'houndoominite',
  'tyranitar-mega': 'tyranitarite',

  // ── Gen 3 ──────────────────────────────────────────────────────────────────
  'blaziken-mega': 'blazikenite',
  'gardevoir-mega': 'gardevoirite',
  'mawile-mega': 'mawilite',
  'aggron-mega': 'aggronite',
  'medicham-mega': 'medichamite',
  'manectric-mega': 'manectite',
  'banette-mega': 'banettite',
  'absol-mega': 'absolite',
  'latias-mega': 'latiasite',
  'latios-mega': 'latiosite',
  'groudon-primal': 'red-orb',
  'kyogre-primal': 'blue-orb',

  // ── Gen 4 ──────────────────────────────────────────────────────────────────
  'lucario-mega': 'lucarionite',
  'garchomp-mega': 'garchompite',

  // ── Gen 5 ──────────────────────────────────────────────────────────────────
  'audino-mega': 'audinite',

  // ── Gen 6 XY ───────────────────────────────────────────────────────────────
  'diancie-mega': 'diancite',

  // ── Gen 6 ORAS ─────────────────────────────────────────────────────────────
  'sceptile-mega': 'sceptilite',
  'swampert-mega': 'swampertite',
  'sableye-mega': 'sablenite',
  'altaria-mega': 'altarianite',
  'gallade-mega': 'galladite',
  'sharpedo-mega': 'sharpedonite',
  'camerupt-mega': 'cameruptite',
  'lopunny-mega': 'lopunnite',
  'glalie-mega': 'glalitite',
  'salamence-mega': 'salamencite',
  'metagross-mega': 'metagrossite',
  'steelix-mega': 'steelixite',
  'abomasnow-mega': 'abomasite',
};

/**
 * Every mega/primal form that counts toward the one-mega-per-team limit,
 * including Rayquaza-mega (which mega-evolves via Dragon Ascent, not a stone).
 */
export const MEGA_FORMS: ReadonlySet<string> = new Set([
  'rayquaza-mega',
  ...Object.keys(MEGA_REQUIRED_ITEMS),
]);

/** Generations where Mega Evolution / Primal Reversion is available. */
export const MEGA_AVAILABLE_GENS: ReadonlySet<number> = new Set([6, 7, 9]);

/** Generation where Gigantamax forms replace Mega Evolution. */
export const GMAX_AVAILABLE_GEN = 8;

/** Returns true if this Pokémon is ANY mega or primal form (including Rayquaza-mega). */
export function isMegaForm(pokemonName: string): boolean {
  return MEGA_FORMS.has(pokemonName);
}

/** Returns true if this Pokémon is a Gigantamax form (suffix -gmax). */
export function isGmaxForm(pokemonName: string): boolean {
  return pokemonName.endsWith('-gmax');
}

/**
 * Returns true if this form is a "special form" that counts toward the
 * one-special-form-per-team limit for the given generation:
 * - Mega/primal in Gen 6, 7, 9
 * - Gigantamax in Gen 8
 */
export function isSpecialForm(pokemonName: string, generation: number): boolean {
  if (MEGA_AVAILABLE_GENS.has(generation)) return isMegaForm(pokemonName);
  if (generation === GMAX_AVAILABLE_GEN) return isGmaxForm(pokemonName);
  return false;
}

/** Returns true if this form requires a specific held item (excludes Rayquaza-mega). */
export function isMegaOrPrimal(pokemonName: string): boolean {
  return pokemonName in MEGA_REQUIRED_ITEMS;
}

/**
 * Returns the PokeAPI item name required for this form, or null if none
 * (includes returning null for Rayquaza-mega, which cannot hold an item).
 */
export function getMegaRequiredItem(pokemonName: string): string | null {
  return MEGA_REQUIRED_ITEMS[pokemonName] ?? null;
}
