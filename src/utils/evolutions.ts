import { EvolutionConditions, PokemonSpeciesEvolutionChain } from '~/server/routers/_app';
import { capitalizeWords } from './text';

// -------------------- Types -----------------------------

type SeparationOptions = {
  rankdir: 'TB' | 'LR';
  containerWidth: number;
  containerHeight: number;
  nodeWidth: number;
  nodeHeight: number;
  maxSiblings: number;
};

export type ComputeNodesepOptions = SeparationOptions;

export type ComputeRanksepOptions = SeparationOptions & {
  rankCount: number;
};

// -------------------- Constants -------------------------

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
  'farfetchd-sirfetchd': "Land three critical hits in a single battle with Galarian Farfetch'd",
  'applin-flapple': 'Use Tart Apple',
  'applin-appletun': 'Use Sweet Apple',
  'applin-dipplin': 'Use Syrupy Apple',
  'dipplin-hydrapple': 'Level up knowing Dragon Cheer',
};

// -------------------- Functions -------------------------

export const formatEvolutionConditions = (
  evolution: EvolutionConditions,
  speciesMap: Map<number, string>,
  evolvingPokemonName: string,
  evolvingToPokemonName: string,
): string => {
  const specialCaseKey = `${evolvingPokemonName}-${evolvingToPokemonName}`;
  if (specialEvolutionCases[specialCaseKey]) {
    return specialEvolutionCases[specialCaseKey];
  }
  if (!evolution) {
    return 'Uknown';
  }
  const conditions: string[] = [];

  if (evolution.minLevel) {
    conditions.push(`Level ${evolution.minLevel}`);
  }

  if (evolution.evolutionTrigger) {
    const evolutionTrigger = evolution.evolutionTrigger;

    if (evolutionTrigger.name === 'trade') {
      let tradeCondition = 'Trade';
      if (evolution.tradeSpeciesId) {
        const tradeSpeciesName = speciesMap.get(evolution.tradeSpeciesId);
        tradeCondition += tradeSpeciesName
          ? ` With ${capitalizeWords(tradeSpeciesName)}`
          : ' With specific Pokémon';
      }
      conditions.push(tradeCondition);
    } else if (evolutionTrigger.name === 'use-item' && evolution.evolutionItem) {
      const evolutionTriggerName = evolution.evolutionItem.name.replace(/-/g, ' ');
      conditions.push(`Use ${capitalizeWords(evolutionTriggerName)}`);
    } else if (evolutionTrigger.name === 'level-up') {
      if (!evolution.minLevel) {
        // Add "Level up" when no specific level is required
        conditions.push('Level up');
      }
      if (evolution.timeOfDay) {
        conditions.push(`During ${evolution.timeOfDay}`);
      } else if (evolution.location) {
        const locationName = evolution.location.name.replace(/-/g, ' ');
        conditions.push(`at ${capitalizeWords(locationName)}`);
      }
    } else if (evolutionTrigger.name === 'spin') {
      conditions.push('Spin');
    } else if (evolutionTrigger.name === 'tower-of-darkness') {
      conditions.push('Tower of Darkness');
    } else if (evolutionTrigger.name === 'tower-of-waters') {
      conditions.push('Tower of Waters');
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
    conditions.push(
      `With ${partySpeciesName ? capitalizeWords(partySpeciesName) : 'specific Pokémon'} in party`,
    );
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

// Node separation with maximum horizontal spacing
export function computeNodesep(options: ComputeNodesepOptions): number {
  const { rankdir, containerWidth, containerHeight, nodeWidth, nodeHeight, maxSiblings } = options;
  const sibs = Math.min(Math.max(maxSiblings, 1), 8);
  if (sibs <= 1) return 60; // Single node, spacing doesn't matter

  /* Vertical layout (TB) – maximize gaps between siblings */
  if (rankdir === 'TB') {
    const totalW = sibs * nodeWidth;
    const avail = containerWidth - totalW;
    if (sibs >= 7) {
      const maxSpacing = avail > 0 ? avail / (sibs - 1) : 0;
      return Math.max(80, maxSpacing); // Higher minimum to prevent tight spacing
    }
    // Regular case for fewer siblings
    const maxSpacing = avail > 0 ? (avail * 0.95) / (sibs - 1) : 0;
    return Math.max(15, maxSpacing);
  }

  /* Horizontal layout (LR) – maximize gaps between siblings */
  const totalH = sibs * nodeHeight;
  const avail = containerHeight - totalH;

  // Use 90% of available space for maximum spread
  const maxSpacing = avail > 0 ? (avail * 0.95) / (sibs - 1) : 0;
  const absoluteMin = 80;
  return Math.max(absoluteMin, maxSpacing);
}

// Rank separation with maximum spacing between evolution levels
export function computeRanksep(options: ComputeRanksepOptions): number {
  const {
    rankdir,
    containerWidth,
    containerHeight,
    nodeWidth,
    nodeHeight,
    rankCount,
    maxSiblings,
  } = options;
  if (rankCount <= 1) return 50;

  /* Horizontal layout (LR) – maximize spacing between ranks */
  if (rankdir === 'LR') {
    const totalW = rankCount * nodeWidth;
    const avail = containerWidth - totalW;

    // Reserve space for edge labels (reduce this to spread nodes more)
    const edgeLabelReserve = 80;
    const minBuffer = 20;

    // Use 85-90% of remaining space after nodes and labels
    const remainingSpace = avail - (edgeLabelReserve + minBuffer);
    const maxSpacing = remainingSpace > 0 ? (remainingSpace * 0.5) / (rankCount - 1) : 0;
    // Minimum spacing to keep edge labels readable
    const absoluteMin = edgeLabelReserve + minBuffer;
    return Math.max(absoluteMin, maxSpacing);
  }

  /* Vertical layout (TB) – maximize spacing between ranks */
  const totalH = rankCount * nodeHeight;
  // For vertical layouts with many siblings, give generous vertical space
  // so siblings can spread horizontally without constraint
  if (maxSiblings >= 7) {
    const avail = containerWidth - totalH;
    const maxSpacing = avail > 0 ? (avail * 0.4) / (rankCount - 1) : 0;
    return Math.max(80, maxSpacing);
  }

  const avail = containerHeight - totalH;
  const maxSpacing = avail > 0 ? (avail * 0.8) / (rankCount - 1) : 0;
  const base = 120;
  return Math.max(base, maxSpacing);
}

export function nodeSizeFromBp(bp: number, rankCount: number, maxSibs: number): number {
  const minGapH = 20;
  const minGapV = 20;
  const maxW = (bp - (rankCount - 1) * minGapH) / rankCount;
  const maxH = (1000 - (maxSibs - 1) * minGapV) / maxSibs;
  return Math.floor(Math.min(maxW, maxH, 180));
}

// Helper function to check if evolution creates variants
export function isVariantEvolution(
  species: PokemonSpeciesEvolutionChain['pokemonSpecies'][number],
  targetSpeciesMap: Map<number, PokemonSpeciesEvolutionChain['pokemonSpecies'][number]>,
): boolean {
  if (species.evolvesToSpecies.length !== 1) return false;
  if (species.evolvesToSpecies[0].pokemonEvolutions.length <= 1) return false;

  const targetSpecies = targetSpeciesMap.get(species.evolvesToSpecies[0].id);
  return Boolean(targetSpecies && targetSpecies.varieties.length > 1);
}

// Helper function to merge location-based evolutions
export function mergeLocationEvolutions(
  pokemonEvolutions: PokemonSpeciesEvolutionChain['pokemonSpecies'][number]['pokemonEvolutions'],
) {
  if (pokemonEvolutions.length <= 1) return pokemonEvolutions[0];

  const baseEvolution = pokemonEvolutions[0];
  const locationNames = pokemonEvolutions
    .map((evo) => evo.location?.name)
    .filter((name): name is string => Boolean(name))
    .map((name) =>
      name
        .replace(/-/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    );

  return {
    ...baseEvolution,
    location:
      locationNames.length > 0 ? { name: locationNames.join(', ') } : baseEvolution.location,
  };
}
