// Utility function to capitalize Pokemon names
export function capitalizeName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

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

// Get damage class color
export const getDamageClassColor = (damageClass: string) => {
  switch (damageClass) {
    case 'physical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'special':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'status':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};
