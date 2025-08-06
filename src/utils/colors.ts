// -------------------- Constants -------------------------

// Pokemon Game Color Map - Tailwind classes with proper contrast
export const pokemonGameColorMap = {
  // Generation 1
  red: { bg: 'bg-red-600/80', text: 'text-white' },
  blue: { bg: 'bg-blue-700/80', text: 'text-white' },
  yellow: { bg: 'bg-yellow-400/80', text: 'text-black' },

  // Generation 2
  gold: { bg: 'bg-amber-500/80', text: 'text-black' },
  silver: { bg: 'bg-gray-400/80', text: 'text-black' },
  crystal: { bg: 'bg-cyan-400/80', text: 'text-black' },

  // Generation 3
  ruby: { bg: 'bg-red-700/80', text: 'text-white' },
  sapphire: { bg: 'bg-blue-700/80', text: 'text-white' },
  emerald: { bg: 'bg-emerald-600/80', text: 'text-white' },
  firered: { bg: 'bg-orange-600/80', text: 'text-white' },
  leafgreen: { bg: 'bg-green-500/80', text: 'text-black' },

  // Generation 4
  diamond: { bg: 'bg-sky-200/80', text: 'text-black' },
  pearl: { bg: 'bg-pink-200/80', text: 'text-black' },
  platinum: { bg: 'bg-gray-500/80', text: 'text-white' },
  heartgold: { bg: 'bg-amber-500/80', text: 'text-black' },
  soulsilver: { bg: 'bg-gray-400/80', text: 'text-black' },

  // Generation 5
  black: { bg: 'bg-gray-800/80', text: 'text-white' },
  white: { bg: 'bg-gray-100/80', text: 'text-black' },
  'black-2': { bg: 'bg-gray-900/80', text: 'text-white' },
  'white-2': { bg: 'bg-white', text: 'text-black' },

  // Generation 6
  x: { bg: 'bg-blue-700/80', text: 'text-white' },
  y: { bg: 'bg-red-600/80', text: 'text-white' },
  'omega-ruby': { bg: 'bg-red-700/80', text: 'text-white' },
  'alpha-sapphire': { bg: 'bg-blue-600/80', text: 'text-white' },

  // Generation 7
  sun: { bg: 'bg-orange-500/80', text: 'text-black' },
  moon: { bg: 'bg-indigo-700/80', text: 'text-white' },
  'ultra-sun': { bg: 'bg-orange-600/80', text: 'text-white' },
  'ultra-moon': { bg: 'bg-indigo-900/80', text: 'text-white' },
  'lets-go-pikachu': { bg: 'bg-yellow-300/80', text: 'text-black' },
  'lets-go-eevee': { bg: 'bg-amber-600/80', text: 'text-white' },

  // Generation 8
  sword: { bg: 'bg-cyan-500/80', text: 'text-black' },
  shield: { bg: 'bg-red-700/80', text: 'text-white' },
  'legends-arceus': { bg: 'bg-stone-600/80', text: 'text-white' },

  // Generation 9
  scarlet: { bg: 'bg-red-600/80', text: 'text-white' },
  violet: { bg: 'bg-violet-600/80', text: 'text-white' },
} as const;

// -------------------- Functions -------------------------

// Utility function to get type color - Complete list
export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    normal: '#A8A878',
    fighting: '#C03028',
    flying: '#A890F0',
    poison: '#A040A0',
    ground: '#E0C068',
    rock: '#B8A038',
    bug: '#A8B820',
    ghost: '#705898',
    steel: '#B8B8D0',
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    psychic: '#F85888',
    ice: '#98D8D8',
    dragon: '#7038F8',
    dark: '#705848',
    fairy: '#EE99AC',
    stellar: '#40E0D0',
    unknown: '#68A090',
  };
  return colors[type] || '#68A090';
}

export const getRgba = (hex: string, alpha = 1) => {
  const hexToRgb = (hex: string) => {
    // Remove # if present and handle both 3 and 6 digit hex codes
    let h = hex.slice(hex.startsWith('#') ? 1 : 0);

    // Convert 3-digit hex to 6-digit
    if (h.length === 3) {
      h = h
        .split('')
        .map((char) => char + char)
        .join('');
    }

    // Validate hex format
    if (h.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(h)) {
      return null;
    }

    // Convert to RGB
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);

    return [r, g, b];
  };

  const rgb = hexToRgb(hex);
  if (!rgb) {
    console.warn(`Invalid hex color: ${hex}`);
    return 'rgba(0, 0, 0, 0)';
  }

  const [r, g, b] = rgb;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Helper function to get color classes by game name (case-insensitive)
export const getGameColor = (gameName: string): { bg: string; text: string } => {
  const normalizedName = gameName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return (
    pokemonGameColorMap[normalizedName as keyof typeof pokemonGameColorMap] || {
      bg: 'bg-gray-500',
      text: 'text-white',
    }
  );
};

// Default color function for bar chart colors
export const getBarColor = (value: number, maxValue: number): string => {
  const percentage = (value / maxValue) * 100;
  if (percentage >= 60) return 'bg-green-500';
  if (percentage >= 50) return 'bg-lime-500';
  if (percentage >= 40) return 'bg-yellow-500';
  if (percentage >= 25) return 'bg-orange-500';
  return 'bg-red-500';
};

// Get stat color based on value
export function getStatColor(baseStat: number, prefix: 'text' | 'bg' = 'bg') {
  if (prefix === 'bg' && baseStat >= 120) return 'bg-green-500';
  if (prefix === 'bg' && baseStat >= 100) return 'bg-lime-500';
  if (prefix === 'bg' && baseStat >= 80) return 'bg-yellow-500';
  if (prefix === 'bg' && baseStat >= 50) return 'bg-orange-500';
  if (prefix === 'text' && baseStat >= 120) return 'text-green-500';
  if (prefix === 'text' && baseStat >= 100) return 'text-lime-500';
  if (prefix === 'text' && baseStat >= 80) return 'text-yellow-500';
  if (prefix === 'text' && baseStat >= 50) return 'text-orange-500';
  return prefix === 'bg' ? 'bg-red-500' : 'text-red-500';
}

// Get damage class color
export const getDamageClassColor = (damageClass: string) => {
  switch (damageClass) {
    case 'physical':
      return 'bg-red-800 dark:bg-red-900';
    case 'special':
      return 'bg-blue-800 dark:bg-blue-900';
    case 'status':
      return 'bg-gray-400';
    default:
      return 'bg-gray-900';
  }
};

export const getDamageFactorColor = (factor: number) => {
  if (factor === 0) return 'bg-gray-900 text-white'; // No effect
  if (factor < 1) return 'bg-red-500 text-white'; // Not very effective
  if (factor >= 4) return 'bg-green-700 text-white'; // Quadruple damage
  if (factor > 1) return 'bg-green-500 text-white'; // Super effective
  return 'dark:bg-gray-500 bg-gray-100'; // Normal effect
};
