import { AllEfficaciesOutput, PokemonTypeName } from '~/server/routers/_app';

// -------------------- Types -----------------------------

// Extract the exact type from your AllEfficaciesOutput
export type EfficacyType = AllEfficaciesOutput[number]['damageType']; // Same as targetType

// Name-based efficacy map
export type TypeEfficacyMap = Map<string, Map<string, number>>;

// -------------------- Constants -------------------------

export const pokemonTypeMap: Record<PokemonTypeName, number> = {
  normal: 1,
  fighting: 2,
  flying: 3,
  poison: 4,
  ground: 5,
  rock: 6,
  bug: 7,
  ghost: 8,
  steel: 9,
  fire: 10,
  water: 11,
  grass: 12,
  electric: 13,
  psychic: 14,
  ice: 15,
  dragon: 16,
  dark: 17,
  fairy: 18,
} as const;

export const pokemonTypes: PokemonTypeName[] = Object.keys(pokemonTypeMap);

// -------------------- Functions -------------------------

export const buildTypeEfficacyMap = (efficacies: AllEfficaciesOutput): TypeEfficacyMap => {
  const efficacyMap = new Map<string, Map<string, number>>();

  efficacies.forEach((efficacy) => {
    const attackingTypeName = efficacy.damageType.name;
    const defendingTypeName = efficacy.targetType.name;

    if (!efficacyMap.has(attackingTypeName)) {
      efficacyMap.set(attackingTypeName, new Map<string, number>());
    }

    efficacyMap.get(attackingTypeName)!.set(defendingTypeName, efficacy.damageFactor);
  });

  return efficacyMap;
};

// Clean lookup function accepting your full type objects
export const getTypeEfficacy = (
  efficacyMap: TypeEfficacyMap,
  attackingType: EfficacyType['name'],
  defendingType: EfficacyType['name'],
): number => {
  return efficacyMap.get(attackingType)?.get(defendingType) ?? 1;
};

export const getTypesByName = (
  types: EfficacyType[],
  names: readonly PokemonTypeName[],
): EfficacyType[] => {
  return types
    .reduce((acc, type) => {
      const index = names.indexOf(type.name);
      if (index !== -1) acc[index] = type;
      return acc;
    }, new Array(names.length).fill(null))
    .filter(Boolean) as EfficacyType[];
};

export const truncateTypeName = (name: PokemonTypeName, format: 'short' | 'medium' = 'medium') => {
  switch (name.toLowerCase()) {
    case 'normal':
      return format === 'short' ? 'NOR' : 'NORMAL';
    case 'fire':
      return format === 'short' ? 'FIR' : 'FIRE';
    case 'water':
      return format === 'short' ? 'WAT' : 'WATER';
    case 'electric':
      return format === 'short' ? 'ELE' : 'ELECTR';
    case 'grass':
      return format === 'short' ? 'GRA' : 'GRASS';
    case 'ice':
      return 'ICE';
    case 'fighting':
      return format === 'short' ? 'FIG' : 'FIGHT';
    case 'poison':
      return format === 'short' ? 'POI' : 'POISON';
    case 'ground':
      return format === 'short' ? 'GRO' : 'GROUND';
    case 'flying':
      return format === 'short' ? 'FLY' : 'FLYING';
    case 'psychic':
      return format === 'short' ? 'PSY' : 'PSYCHC';
    case 'bug':
      return 'BUG';
    case 'rock':
      return format === 'short' ? 'ROC' : 'ROCK';
    case 'ghost':
      return format === 'short' ? 'GHO' : 'GHOST';
    case 'dragon':
      return format === 'short' ? 'DRA' : 'DRAGON';
    case 'dark':
      return format === 'short' ? 'DAR' : 'DARK';
    case 'steel':
      return format === 'short' ? 'STE' : 'STEEL';
    case 'fairy':
      return format === 'short' ? 'FAI' : 'FAIRY';
    case 'stellar':
      return format === 'short' ? 'STL' : 'STELLR';
    default:
      return 'N/A';
  }
};

export const getDamageFactorText = (factor: number) => {
  if (factor === 0) return '0';
  if (factor === 0.5) return '½';
  if (factor === 1) return '';
  if (factor === 2) return '2';
  return `${factor}`;
};
