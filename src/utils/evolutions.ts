import { EvolutionConditions, PokemonSpeciesEvolutionChain } from '~/server/routers/_app';
import { capitalizeWords } from './text';

type SeparationOptions = {
  rankdir: 'TB' | 'LR';
  containerWidth: number;
  containerHeight: number;
  nodeWidth: number;
  nodeHeight: number;
};

export type ComputeNodesepOptions = SeparationOptions & {
  maxSiblings: number;
};

export type ComputeRanksepOptions = SeparationOptions & {
  rankCount: number;
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
  'farfetchd-sirfetchd': "Land three critical hits in a single battle with Galarian Farfetch'd",
  'applin-flapple': 'Use Tart Apple',
  'applin-appletun': 'Use Sweet Apple',
  'applin-dipplin': 'Use Syrupy Apple',
  'dipplin-hydrapple': 'Level up knowing Dragon Cheer',
};

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

// computeNodesep.ts
export function computeNodesep(options: ComputeNodesepOptions): number {
  const { rankdir, containerWidth, containerHeight, nodeWidth, nodeHeight, maxSiblings } = options;
  const sibs = Math.min(Math.max(maxSiblings, 1), 8);
  if (sibs <= 1) return 50;

  /* Horizontal layout (TB) – gaps between siblings */
  if (rankdir === 'TB') {
    const totalW = sibs * nodeWidth;
    const avail = containerWidth - totalW;

    // progressive gap that stays modest
    const base = 50;
    const extra = Math.max(0, sibs - 3) * 8; // +8 px per extra sibling
    const minGap = base + extra;

    return Math.max(minGap, avail / (sibs - 1));
  }

  /* Vertical layout (LR) – gaps between siblings */
  const totalH = sibs * nodeHeight;
  const avail = containerHeight - totalH;

  const minGap = 60;

  return Math.max(minGap, avail / (sibs - 1));
}

// computeRanksep.ts
export function computeRanksep(options: ComputeRanksepOptions): number {
  const { rankdir, containerWidth, containerHeight, nodeWidth, nodeHeight, rankCount } = options;
  if (rankCount <= 1) return 50;

  /* Horizontal layout  (LR) – vertical gaps between ranks */
  if (rankdir === 'LR') {
    const totalW = rankCount * nodeWidth;
    const avail = containerWidth - totalW;
    const label = 96; // edge-label width
    const buffer = rankCount > 3 ? 20 : 40;

    const cap =
      containerWidth < 640
        ? 120
        : containerWidth < 768
          ? 140
          : containerWidth < 1024
            ? 160
            : containerWidth < 1280
              ? 180
              : containerWidth < 1536
                ? 200
                : 220;

    // add extra vertical space when many siblings *per rank*
    const gap = Math.max(label + buffer, Math.min(cap, avail / (rankCount - 1)));
    return gap;
  }

  /* Vertical layout (TB) – horizontal gaps between ranks */
  const totalH = rankCount * nodeHeight;
  const avail = containerHeight - totalH;

  const base = 110;
  return Math.max(base, avail / (rankCount - 1));
}

export function nodeSizeFromBp(bp: number, rankCount: number, maxSibs: number): number {
  const MIN_GAP_H = 20;
  const MIN_GAP_V = 20;
  const maxW = (bp - (rankCount - 1) * MIN_GAP_H) / rankCount;
  const maxH = (800 - (maxSibs - 1) * MIN_GAP_V) / maxSibs;
  return Math.floor(Math.min(maxW, maxH, 144));
}
// const breakpoints = [640, 768, 1024, 1280, 1536];

export const snapToBreakpoints = (w: number) =>
  [640, 768, 1024, 1280, 1536].reduce((prev, bp) => (w >= bp ? bp : prev), 0) || 640;

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
