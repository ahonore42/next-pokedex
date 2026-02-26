import { PokemonMoves } from '~/server/routers/_app';
import { formatPercentage } from './text';

// -------------------- Types -----------------------------

export type MoveMap = Record<string, PokemonMoves>;

type Gendered = readonly [
  male: { value: string; symbol: '♂'; color: string },
  female: { value: string; symbol: '♀'; color: string },
  genderless: null,
];

type Genderless = readonly [null, null, { value: 'Genderless' }];

type FormattedGenderRate = Gendered | Genderless;

// -------------------- Constants -------------------------

// Starter pokemon ids
export const starterIds: Record<number, number[]> = {
  1: [1, 4, 7],
  2: [152, 155, 158],
  3: [252, 255, 258],
  4: [387, 390, 393],
  5: [495, 498, 501],
  6: [650, 653, 656],
  7: [722, 725, 728],
  8: [810, 813, 816],
  9: [906, 909, 912],
};

// Significant Pokemon IDs - Top 10 most significant per generation
// Includes: Legendaries, Competitively Viable Starters (final forms), Fan Favorites, Competitive Staples, Story-important Pokemon
export const significantPokemonIds: number[] = [
  // Generation 1 - Kanto
  3, // Venusaur (competitively viable starter)
  6, // Charizard (competitively viable starter)
  9, // Blastoise (iconic starter)
  25, // Pikachu (mascot)
  144, // Articuno (legendary bird)
  145, // Zapdos (legendary bird)
  146, // Moltres (legendary bird)
  150, // Mewtwo (legendary)
  151, // Mew (mythical)
  149, // Dragonite (pseudo-legendary)

  // Generation 2 - Johto
  157, // Typhlosion (somewhat viable starter)
  160, // Feraligatr (somewhat viable starter)
  249, // Lugia (legendary)
  250, // Ho-Oh (legendary)
  251, // Celebi (mythical)
  196, // Espeon (fan favorite)
  197, // Umbreon (fan favorite)
  248, // Tyranitar (pseudo-legendary)
  245, // Suicune (legendary beast)
  227, // Skarmory (competitive staple)

  // Generation 3 - Hoenn
  254, // Sceptile (reasonably viable starter)
  257, // Blaziken (competitively viable starter)
  260, // Swampert (competitively viable starter)
  382, // Kyogre (legendary)
  383, // Groudon (legendary)
  384, // Rayquaza (legendary)
  385, // Jirachi (mythical)
  386, // Deoxys (mythical)
  373, // Salamence (pseudo-legendary)
  376, // Metagross (pseudo-legendary)

  // Generation 4 - Sinnoh
  392, // Infernape (competitively viable starter)
  395, // Empoleon (somewhat viable starter)
  483, // Dialga (legendary)
  484, // Palkia (legendary)
  487, // Giratina (legendary)
  493, // Arceus (mythical)
  448, // Lucario (fan favorite)
  445, // Garchomp (pseudo-legendary)
  474, // Porygon-Z (competitive staple)
  491, // Darkrai (mythical)

  // Generation 5 - Unova
  497, // Serperior (competitively viable with Contrary)
  643, // Reshiram (legendary)
  644, // Zekrom (legendary)
  646, // Kyurem (legendary)
  647, // Keldeo (mythical)
  648, // Meloetta (mythical)
  635, // Hydreigon (pseudo-legendary)
  609, // Chandelure (fan favorite)
  571, // Zoroark (fan favorite)
  645, // Landorus (competitive staple)

  // Generation 6 - Kalos
  658, // Greninja (extremely competitively viable starter)
  716, // Xerneas (legendary)
  717, // Yveltal (legendary)
  718, // Zygarde (legendary)
  719, // Diancie (mythical)
  720, // Hoopa (mythical)
  700, // Sylveon (fan favorite)
  681, // Aegislash (competitive staple)
  663, // Talonflame (competitive staple)
  706, // Goodra (pseudo-legendary)

  // Generation 7 - Alola
  724, // Decidueye (reasonably viable starter)
  727, // Incineroar (extremely competitively viable starter)
  730, // Primarina (competitively viable starter)
  791, // Solgaleo (legendary)
  792, // Lunala (legendary)
  800, // Necrozma (legendary)
  802, // Marshadow (mythical)
  778, // Mimikyu (fan favorite)
  784, // Kommo-o (pseudo-legendary)
  785, // Tapu Koko (legendary/competitive staple)

  // Generation 8 - Galar
  812, // Rillaboom (competitively viable starter)
  815, // Cinderace (competitively viable starter)
  888, // Zacian (legendary)
  889, // Zamazenta (legendary)
  890, // Eternatus (legendary)
  893, // Zarude (mythical)
  884, // Duraludon (pseudo-legendary)
  892, // Urshifu (legendary/competitive staple)
  845, // Cramorant (fan favorite)
  879, // Copperajah (competitive staple)

  // Generation 9 - Paldea
  908, // Meowscarada (competitively viable starter)
  911, // Skeledirge (competitively viable starter)
  1007, // Koraidon (legendary)
  1008, // Miraidon (legendary)
  1001, // Gholdengo (mythical evolution)
  1024, // Terapagos (legendary)
  998, // Baxcalibur (pseudo-legendary)
  937, // Ceruledge (fan favorite)
  959, // Tinkaton (fan favorite)
  983, // Kingambit (competitive staple)
];

// Define the order of learn methods for display
const methodOrder = [
  'level-up',
  'machine', // TMs/TRs
  'egg',
  'tutor',
  'transfer',
  'light-ball-egg',
  'colosseum-purification',
  'xd-shadow',
  'xd-purification',
  'form-change',
  'zygarde-cube',
];

// -------------------- Functions -------------------------

// Get learn method display name
export const getMethodDisplayName = (method: string, _moves: PokemonMoves) => {
  switch (method) {
    case 'level-up':
      return 'Level Up';
    case 'machine':
      return 'TM/HM';
    case 'egg':
      return 'Egg Moves';
    case 'tutor':
      return 'Move Tutor';
    case 'transfer':
      return 'Transfer Only';
    default:
      return method.replaceAll('-', ' ');
  }
};

// Sort move methods by predefined order, then alphabetically
export const sortMovesByMethod = (moveMap: MoveMap) =>
  Object.keys(moveMap).sort((a, b) => {
    const aIndex = methodOrder.indexOf(a);
    const bIndex = methodOrder.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    } else if (aIndex !== -1) {
      return -1;
    } else if (bIndex !== -1) {
      return 1;
    } else {
      return a.localeCompare(b);
    }
  });

// Get damage class icon
export const getDamageClassIcon = (damageClass: string) => {
  switch (damageClass) {
    case 'physical':
      return '💥'; // Physical
    case 'special':
      return '🌀'; // Special
    case 'status':
      return '⚡'; // Status
    default:
      return '❓';
  }
};

export function formatGenderRate(genderRate: number): FormattedGenderRate {
  if (genderRate === -1) {
    return [null, null, { value: 'Genderless' }] as const;
  }

  const male = {
    value: `${formatPercentage(((8 - genderRate) / 8) * 100)}%`,
    symbol: '♂' as const,
    color: 'text-blue-600 border-blue-300',
  };

  const female = {
    value: `${formatPercentage((genderRate / 8) * 100)}%`,
    symbol: '♀' as const,
    color: 'text-red-500 border-red-300',
  };

  return [male, female, null] as const;
}
