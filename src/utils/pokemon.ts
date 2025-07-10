import { EvolutionDetail } from "~/server/routers/_app";

// Utility function to capitalize Pokemon names
export function capitalizeName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const capitalizeWords = (str: string) => str.replace(/\b\w/g, l => l.toUpperCase());

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

const specialEvolutionCases: Record<string, string> = {
  'primeape-annihilape': 'Level up after using Rage Fist 20 times',
  'pawmo-pawmot': "Level up after walking 1000 steps with Let's Go!",
  'bramblin-brambleghast': "Level up after walking 1000 steps with Let's Go!",
  'rellor-rabsca': "Level up after walking 1000 steps with Let's Go!",
  'finizen-palafin': 'Level up to 38 while connected to another player via the Union Circle',
  'bisharp-kingambit': "Level up after defeating three Bisharp that hold a Leader's Crest",
  'gimmighoul-gholdengo': 'Level up with 999 Gimmighoul Coins in the bag',
  'meltan-melmetal': 'Evolves with 400 Meltan Candies in Pokémon GO',
  'magneton-magnezone': 'Level up in a special magnetic field or use a Thunder Stone',
  'farfetchd-sirfetchd': 'Land three critical hits in a single battle with Galarian Farfetch\'d',
};

export const formatEvolutionConditions = (
  evolution: EvolutionDetail,
  speciesMap: Map<number, string>,
  evolvingPokemonName: string,
  evolvingToPokemonName: string,
): string => {
  const specialCaseKey = `${evolvingPokemonName}-${evolvingToPokemonName}`;
  if (specialEvolutionCases[specialCaseKey]) {
    return specialEvolutionCases[specialCaseKey];
  }

  const conditions: string[] = [];

  if (evolution.minLevel) {
    conditions.push(`Level ${evolution.minLevel}`);
  }

  if (evolution.evolutionTrigger?.name === 'trade') {
    let tradeCondition = 'Trade';
    if (evolution.tradeSpeciesId) {
      const tradeSpeciesName = speciesMap.get(evolution.tradeSpeciesId);
      tradeCondition += tradeSpeciesName ? ` With ${capitalizeWords(tradeSpeciesName)}` : ' With specific Pokémon';
    }
    conditions.push(tradeCondition);
  } else if (evolution.evolutionTrigger?.name === 'use-item' && evolution.evolutionItem) {
    const evolutionTriggerName = evolution.evolutionItem.name.replace(/-/g, ' ');
    conditions.push(`Use ${capitalizeWords(evolutionTriggerName)}`);
  } else if (evolution.evolutionTrigger?.name === 'level-up') {
    if (evolution.timeOfDay) {
      conditions.push(`During ${evolution.timeOfDay}`);
    } else if (evolution.location) {
      const locationName = evolution.location.name.replace(/-/g, ' ');
      conditions.push(`at ${capitalizeWords(locationName)}`);
    }
  }

  if (evolution.heldItem) {
    const itemName = evolution.heldItem.name.replace(/-/g, ' ');
    conditions.push(`Holding ${capitalizeWords(itemName)}`);
  }
  if (evolution.knownMove) {
    const knownMoveName = evolution.knownMove.name.replace(/-/g, ' ');
    conditions.push(`Knowing ${capitalizeWords(knownMoveName)}`);
  }
  if (evolution.knownMoveType) {
    const knownMoveType = evolution.knownMoveType.name.replace(/-/g, ' ');
    conditions.push(`Knowing a ${capitalizeWords(knownMoveType)} type move`);
  }
  if (evolution.minHappiness) {
    conditions.push(`With ${evolution.minHappiness}+ Happiness`);
  }
  if (evolution.minBeauty) {
    conditions.push(`With ${evolution.minBeauty}+ Beauty`);
  }
  if (evolution.minAffection) {
    conditions.push(`With ${evolution.minAffection}+ Affection`);
  }
  if (evolution.needsOverworldRain) {
    conditions.push(`During Rain`);
  }
  if (evolution.partySpeciesId) {
    const partySpeciesName = speciesMap.get(evolution.partySpeciesId);
    conditions.push(`With ${partySpeciesName ? capitalizeWords(partySpeciesName) : 'specific Pokémon'} in party`);
  }
  if (evolution.partyTypeId && evolution.partyType) {
    const partyTypeName = evolution.partyType.names[0]?.name || evolution.partyType.name;
    conditions.push(`With ${capitalizeWords(partyTypeName)} Type in party`);
  }
  if (evolution.relativePhysicalStats !== null && evolution.relativePhysicalStats !== undefined) {
    let statComparison = '';
    if (evolution.relativePhysicalStats === 1) {
      statComparison = 'Attack > Defense';
    } else if (evolution.relativePhysicalStats === 0) {
      statComparison = 'Attack = Defense';
    } else if (evolution.relativePhysicalStats === -1) {
      statComparison = 'Attack < Defense';
    }
    if (statComparison) {
      conditions.push(`When ${statComparison}`);
    }
  }
  if (evolution.turnUpsideDown) {
    conditions.push(`While holding console upside down`);
  }

  const displayString: string =
    conditions.length > 0 ? conditions.join(' and ') : 'No special conditions';

  return displayString;
};
