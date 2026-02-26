import { Prisma } from '@prisma/client';

const DEFAULT_LANGUAGE_ID = 9; // English

const languageNameSelect = {
  where: { languageId: DEFAULT_LANGUAGE_ID },
  select: { name: true },
} as const;

// Type Selectors
export const typeIdNameSelect = {
  select: {
    id: true,
    name: true,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
  },
};

export const basicTypeSelect = {
  select: {
    slot: true,
    type: typeIdNameSelect,
  },
};

export const orderedTypeSelect = {
  ...basicTypeSelect,
  orderBy: { slot: 'asc' as const },
};

export const typeEffectivenessSelect = {
  damageFactor: true,
  targetType: {
    select: {
      id: true,
      name: true,
      names: {
        where: { languageId: DEFAULT_LANGUAGE_ID },
        select: { name: true },
      },
    },
  },
};

export const allTypeEfficaciesSelect = {
  ...typeEffectivenessSelect,
  damageType: {
    select: {
      id: true,
      name: true,
      names: {
        where: { languageId: DEFAULT_LANGUAGE_ID },
        select: { name: true },
      },
    },
  },
};

// Evolution chain selectors
export const evolutionBabyTriggerItemSelect = {
  select: {
    id: true,
    name: true,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
  },
};

export const pokemonEvolutionsSelect = {
  select: {
    pokemonSpeciesId: true,
    evolutionTrigger: {
      select: {
        name: true,
      },
    },
    minLevel: true,
    evolutionItem: {
      select: {
        name: true,
      },
    },
    heldItem: {
      select: {
        name: true,
      },
    },
    knownMove: {
      select: {
        name: true,
      },
    },
    knownMoveType: {
      select: {
        name: true,
      },
    },
    location: {
      select: {
        name: true,
      },
    },
    minHappiness: true,
    minBeauty: true,
    minAffection: true,
    needsOverworldRain: true,
    partySpeciesId: true,
    partyTypeId: true,
    partyType: {
      select: {
        name: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
      },
    },
    relativePhysicalStats: true,
    tradeSpeciesId: true,
    turnUpsideDown: true,
    timeOfDay: true,
  },
};

export const officialArtworkSelect = {
  sprites: {
    select: {
      officialArtworkFront: true,
    },
  },
} satisfies Prisma.PokemonSelect;

export const evolvesToSpeciesSelect = {
  select: {
    id: true,
    name: true,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
    pokemonEvolutions: {
      select: {
        evolutionTrigger: {
          select: {
            name: true,
          },
        },
        minLevel: true,
        pokemonSpeciesId: true,
        evolutionItem: {
          select: {
            name: true,
          },
        },
        heldItem: {
          select: {
            name: true,
          },
        },
        knownMove: {
          select: {
            name: true,
          },
        },
        knownMoveType: {
          select: {
            name: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
        minHappiness: true,
        minBeauty: true,
        minAffection: true,
        needsOverworldRain: true,
        partySpeciesId: true,
        partyTypeId: true,
        partyType: {
          select: {
            name: true,
            names: {
              where: { languageId: DEFAULT_LANGUAGE_ID },
              select: { name: true },
            },
          },
        },
        relativePhysicalStats: true,
        tradeSpeciesId: true,
        turnUpsideDown: true,
        timeOfDay: true,
      },
    },
  },
};

export const varietiesSelect = {
  select: {
    isDefault: true,
    pokemon: {
      select: {
        id: true,
        name: true,
        sprites: {
          select: {
            frontDefault: true,
          },
        },
        types: orderedTypeSelect,
      },
    },
  },
  where: { isDefault: true },
};

export const evolutionSpeciesSelect = {
  id: true,
  name: true,
  order: true,
  names: {
    where: { languageId: DEFAULT_LANGUAGE_ID },
    select: { name: true },
  },
  varieties: {
    select: {
      isDefault: true,
      pokemon: {
        select: {
          id: true,
          name: true,
          sprites: {
            select: {
              frontDefault: true,
            },
          },
          types: orderedTypeSelect,
        },
      },
    },
    where: {
      AND: [
        { NOT: { pokemon: { name: { contains: '-gmax' } } } },
        { NOT: { pokemon: { name: { contains: '-mega' } } } },
      ],
    },
  },
  evolvesFromSpecies: {
    select: {
      id: true,
      name: true,
    },
  },
  evolvesToSpecies: evolvesToSpeciesSelect,
  pokemonEvolutions: pokemonEvolutionsSelect,
};

// Pokemon Selectors
export const basicSpeciesNamesSelect = {
  where: { languageId: DEFAULT_LANGUAGE_ID },
  select: { name: true },
};

export const basicSpriteSelect = {
  select: {
    frontDefault: true,
    frontShiny: true,
    backDefault: true,
    backShiny: true,
  },
};

export const extendedSpriteSelect = {
  select: {
    frontDefault: true,
    frontShiny: true,
    frontFemale: true,
    frontShinyFemale: true,
    backDefault: true,
    backShiny: true,
    backFemale: true,
    backShinyFemale: true,
    officialArtworkShiny: true,
    officialArtworkFront: true,
  },
};

export const basicAbilitySelect = {
  select: {
    slot: true,
    isHidden: true,
    ability: {
      select: {
        id: true,
        name: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
      },
    },
  },
};

export const basicStatSelect = {
  select: {
    baseStat: true,
    effort: true,
    stat: {
      select: {
        id: true,
        name: true,
      },
    },
  },
};

export const basicPokedexSelect = {
  select: {
    pokedexNumber: true,
    pokedex: {
      select: {
        id: true,
        name: true,
      },
    },
  },
};

export const basicFlavorTextSelect = {
  where: {
    languageId: DEFAULT_LANGUAGE_ID,
  },
  select: {
    flavorText: true,
  },
};

export const orderedSingleFlavorTextSelect = {
  where: { languageId: DEFAULT_LANGUAGE_ID },
  select: { flavorText: true },
  orderBy: { versionGroupId: 'desc' as const },
  take: 1,
};

export const orderedSingleEffectTextSelect = {
  where: { languageId: DEFAULT_LANGUAGE_ID },
  select: {
    effect: true,
    shortEffect: true,
  },
  take: 1,
};

export const itemDetailSelect = {
  select: {
    id: true,
    name: true,
    cost: true,
    sprite: true,
    flingPower: true,
    generationId: true,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
    itemCategory: {
      select: {
        id: true,
        name: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
        pocket: {
          select: {
            id: true,
            name: true,
            names: {
              where: { languageId: DEFAULT_LANGUAGE_ID },
              select: { name: true },
            },
          },
        },
      },
    },
    effectTexts: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { effect: true, shortEffect: true },
    },
    flavorTexts: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: {
        flavorText: true,
        versionGroup: {
          select: {
            id: true,
            name: true,
            order: true,
            generation: { select: { id: true, name: true } },
            versions: {
              select: {
                id: true,
                name: true,
                names: {
                  where: { languageId: DEFAULT_LANGUAGE_ID },
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { versionGroupId: 'asc' as const },
    },
    pokemonItems: {
      select: {
        rarity: true,
        version: {
          select: {
            id: true,
            name: true,
            names: {
              where: { languageId: DEFAULT_LANGUAGE_ID },
              select: { name: true },
            },
          },
        },
        pokemon: {
          select: {
            id: true,
            name: true,
            sprites: { select: { frontDefault: true } },
          },
        },
      },
      orderBy: [{ pokemonId: 'asc' as const }, { versionId: 'asc' as const }],
    },
  },
};

export const itemListSelect = {
  select: {
    id: true,
    name: true,
    cost: true,
    sprite: true,
    generationId: true,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
    itemCategory: {
      select: {
        id: true,
        name: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
        pocket: {
          select: {
            id: true,
            name: true,
            names: {
              where: { languageId: DEFAULT_LANGUAGE_ID },
              select: { name: true },
            },
          },
        },
      },
    },
    effectTexts: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { shortEffect: true },
      take: 1,
    },
    flavorTexts: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { flavorText: true },
      orderBy: { versionGroupId: 'desc' as const },
      take: 1,
    },
  },
};

export const locationListSelect = {
  select: {
    id: true,
    name: true,
    regionId: true,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
    areas: {
      select: {
        id: true,
        name: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
        _count: {
          select: { pokemonEncounters: true },
        },
      },
      orderBy: { id: 'asc' as const },
    },
  },
};

export const abilityListSelect = {
  select: {
    id: true,
    name: true,
    generationId: true,
    isMainSeries: true,
    _count: {
      select: { pokemonAbilities: true },
    },
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
    effectTexts: orderedSingleEffectTextSelect,
    flavorTexts: orderedSingleFlavorTextSelect,
  },
};

export const versionGroupSelect = {
  select: {
    id: true,
    name: true,
    order: true,
    generation: {
      select: {
        id: true,
        name: true,
      },
    },
    versions: {
      select: {
        name: true,
      },
    },
  },
};

export const defaultPokemonSelect = {
  id: true,
  name: true,
  height: true,
  weight: true,
  baseExperience: true,
  isDefault: true,
  criesLatest: true,
  criesLegacy: true,
  sprites: extendedSpriteSelect,
  types: basicTypeSelect,
  abilities: basicAbilitySelect,
  stats: basicStatSelect,
  pokemonSpecies: {
    select: {
      id: true,
      flavorTexts: basicFlavorTextSelect,
      pokedexNumbers: basicPokedexSelect,
    },
  },
} satisfies Prisma.PokemonSelect;

export const extendedSpeciesNamesSelect = {
  where: { languageId: DEFAULT_LANGUAGE_ID },
  select: {
    name: true,
    genus: true,
  },
};

export const detailedAbilitySelect = {
  select: {
    slot: true,
    isHidden: true,
    ability: {
      select: {
        id: true,
        name: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
        flavorTexts: orderedSingleFlavorTextSelect,
        effectTexts: orderedSingleEffectTextSelect,
      },
    },
  },
  orderBy: { slot: 'asc' as const },
};

export const detailedStatSelect = {
  select: {
    baseStat: true,
    effort: true,
    stat: {
      select: {
        id: true,
        name: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
        isBattleOnly: true,
        gameIndex: true,
      },
    },
  },
  orderBy: { stat: { id: 'asc' as const } },
};

export const detailedFlavorTextSelect = {
  where: { languageId: DEFAULT_LANGUAGE_ID },
  select: {
    flavorText: true,
    version: {
      select: {
        id: true,
        name: true,
        versionGroup: {
          select: {
            id: true,
            generation: { select: { id: true, name: true } },
          },
        },
      },
    },
  },
  orderBy: { version: { id: 'desc' as const } },
};

export const detailedPokedexSelect = {
  select: {
    pokedexNumber: true,
    pokedex: {
      select: {
        id: true,
        name: true,
        isMainSeries: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
        region: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  },
  orderBy: [{ pokedex: { isMainSeries: 'desc' as const } }, { pokedex: { id: 'asc' as const } }],
};

export const typePastSelect = {
  select: {
    slot: true,
    generation: {
      select: {
        id: true,
        name: true,
      },
    },
    type: {
      select: {
        id: true,
        name: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
      },
    },
  },
  orderBy: [{ generationId: 'asc' as const }, { slot: 'asc' as const }],
};

export const abilityPastSelect = {
  select: {
    slot: true,
    isHidden: true,
    generation: {
      select: {
        id: true,
        name: true,
      },
    },
    ability: {
      select: {
        id: true,
        name: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
      },
    },
  },
  orderBy: [{ generationId: 'asc' as const }, { slot: 'asc' as const }],
};

export const generationSelect = {
  select: {
    id: true,
    name: true,
    mainRegion: {
      select: {
        id: true,
        name: true,
      },
    },
  },
};

export const pokemonColorSelect = {
  select: {
    id: true,
    name: true,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
  },
};

export const pokemonShapeSelect = {
  select: {
    id: true,
    name: true,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
    awesomeNames: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { awesomeName: true },
    },
  },
};

export const pokemonHabitatSelect = {
  select: {
    id: true,
    name: true,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
  },
};

export const growthRateSelect = {
  select: {
    id: true,
    name: true,
    formula: true,
    descriptions: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { description: true },
    },
  },
};

export const eggGroupSelect = {
  select: {
    eggGroup: {
      select: {
        id: true,
        name: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
      },
    },
  },
};

export const palParkEncountersSelect = {
  select: {
    baseScore: true,
    rate: true,
    palParkArea: {
      select: {
        id: true,
        name: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
      },
    },
  },
};

export const pokemonFormsSelect = {
  select: {
    id: true,
    name: true,
    order: true,
    formOrder: true,
    isDefault: true,
    isBattleOnly: true,
    isMega: true,
    formName: true,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: {
        name: true,
        pokemonName: true,
      },
    },
    types: orderedTypeSelect,
    sprites: basicSpriteSelect,
    versionGroup: versionGroupSelect,
  },
  orderBy: { formOrder: 'asc' as const },
};

export const defaultPokemonSpeciesSelect = {
  select: {
    id: true,
    name: true,
    order: true,
    genderRate: true,
    captureRate: true,
    baseHappiness: true,
    isBaby: true,
    isLegendary: true,
    isMythical: true,
    hatchCounter: true,
    hasGenderDifferences: true,
    formsSwitchable: true,
    // Species names
    names: extendedSpeciesNamesSelect,
    // Flavor texts (Pokedex entries)
    flavorTexts: detailedFlavorTextSelect,
    // Generation info
    generation: generationSelect,
    // Color
    pokemonColor: pokemonColorSelect,
    // Shape
    pokemonShape: pokemonShapeSelect,
    // Habitat
    pokemonHabitat: pokemonHabitatSelect,
    // Growth rate
    growthRate: growthRateSelect,
    // Egg groups
    eggGroups: eggGroupSelect,
    // Complete evolution chain using reusable selectors
    evolutionChain: {
      select: {
        id: true,
        babyTriggerItem: evolutionBabyTriggerItemSelect,
        // Get all species in this evolution chain with complete data
        pokemonSpecies: {
          select: evolutionSpeciesSelect,
          orderBy: { order: 'asc' as const },
        },
      },
    },
    // Pokedex numbers
    pokedexNumbers: detailedPokedexSelect,
    // Pal Park encounters
    palParkEncounters: palParkEncountersSelect,
  },
};

export const moveLearnMethodSelect = {
  select: {
    id: true,
    name: true,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
    descriptions: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { description: true },
    },
  },
};

export const moveDamageClassSelect = {
  select: {
    id: true,
    name: true,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
  },
};

export const moveMachinesSelect = {
  select: {
    item: {
      select: {
        name: true,
      },
    },
    versionGroup: {
      select: {
        order: true,
      },
    },
  },
};

export const moveSelect = {
  select: {
    id: true,
    name: true,
    power: true,
    pp: true,
    accuracy: true,
    priority: true,
    effectChance: true,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
    type: typeIdNameSelect,
    moveDamageClass: moveDamageClassSelect,
    effectEntries: orderedSingleEffectTextSelect,
    flavorTexts: orderedSingleFlavorTextSelect,
    machines: moveMachinesSelect,
  },
};

export const movesetSelect = {
  select: {
    levelLearnedAt: true,
    order: true,
    versionGroup: versionGroupSelect,
    moveLearnMethod: moveLearnMethodSelect,
    move: moveSelect,
  },
  orderBy: [
    { versionGroup: { generationId: 'desc' as const } },
    { versionGroup: { order: 'desc' as const } },
    { moveLearnMethodId: 'asc' as const },
    { levelLearnedAt: 'asc' as const },
    { move: { name: 'asc' as const } },
  ],
};

export const pokemonSearchSelect = {
  id: true,
  name: true,
  sprites: { select: { frontDefault: true } },
  types: { select: { type: { select: { name: true } } } },
  pokemonSpecies: {
    select: {
      id: true,
    },
  },
};

/**
 * Enhanced item selection for detailed queries
 */
const detailedItemSelect = {
  select: {
    id: true,
    name: true,
    cost: true,
    sprite: true,
    itemCategory: {
      select: {
        id: true,
        name: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
      },
    },
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
    flavorTexts: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { flavorText: true },
      orderBy: { versionGroupId: 'desc' as const },
      take: 1,
    },
  },
};

/**
 * Enhanced location selection for encounter data
 */
const detailedLocationSelect = {
  select: {
    id: true,
    name: true,
    region: {
      select: {
        id: true,
        name: true,
      },
    },
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
  },
};

/**
 * Enhanced location area selection
 */
const detailedLocationAreaSelect = {
  select: {
    id: true,
    name: true,
    gameIndex: true,
    location: detailedLocationSelect,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
  },
};

/**
 * Enhanced encounter method selection
 */
const detailedEncounterMethodSelect = {
  select: {
    id: true,
    name: true,
    order: true,
    names: {
      where: { languageId: DEFAULT_LANGUAGE_ID },
      select: { name: true },
    },
  },
};

/**
 * Enhanced encounter condition selection
 */
const detailedEncounterConditionSelect = {
  select: {
    encounterConditionValue: {
      select: {
        id: true,
        name: true,
        isDefault: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
        encounterCondition: {
          select: {
            id: true,
            name: true,
            names: {
              where: { languageId: DEFAULT_LANGUAGE_ID },
              select: { name: true },
            },
          },
        },
      },
    },
  },
};

/**
 * Location detail selector (depends on versionGroupSelect, detailedEncounterMethodSelect, detailedEncounterConditionSelect)
 */
export const locationDetailSelect = {
  select: {
    id: true,
    name: true,
    regionId: true,
    names: languageNameSelect,
    areas: {
      select: {
        id: true,
        name: true,
        names: languageNameSelect,
        pokemonEncounters: {
          select: {
            minLevel: true,
            maxLevel: true,
            chance: true,
            pokemon: {
              select: {
                id: true,
                name: true,
                sprites: { select: { frontDefault: true } },
              },
            },
            version: {
              select: {
                id: true,
                name: true,
                versionGroup: versionGroupSelect,
              },
            },
            encounterMethod: detailedEncounterMethodSelect,
            conditionValueMap: detailedEncounterConditionSelect,
          },
          orderBy: [
            { version: { id: 'asc' as const } },
            { minLevel: 'asc' as const },
          ],
        },
      },
      orderBy: { id: 'asc' as const },
    },
  },
};

/**
 * Enhanced encounter selection
 */
export const detailedEncounterSelect = {
  select: {
    minLevel: true,
    maxLevel: true,
    chance: true,
    pokemonId: true,
    locationArea: detailedLocationAreaSelect,
    version: {
      select: {
        id: true,
        name: true,
        versionGroup: versionGroupSelect,
      },
    },
    encounterMethod: detailedEncounterMethodSelect,
    conditionValueMap: detailedEncounterConditionSelect,
  },
  orderBy: [{ locationArea: { location: { name: 'asc' as const } } }, { minLevel: 'asc' as const }],
};

/**
 * Enhanced held items selection
 */
export const heldItemsSelect = {
  select: {
    rarity: true,
    version: {
      select: {
        id: true,
        name: true,
      },
    },
    item: detailedItemSelect,
  },
};

/**
 * Enhanced game indices selection
 */
export const gameIndicesSelect = {
  select: {
    gameIndex: true,
    version: {
      select: {
        id: true,
        name: true,
      },
    },
  },
};

/**
 * Enhanced gender details selection
 */
const detailedGenderDetailsSelect = {
  select: {
    gender: {
      select: {
        id: true,
        name: true,
      },
    },
  },
};

/**
 * Enhanced evolution relationships selection
 */
const detailedEvolutionRelationshipsSelect = {
  select: {
    id: true,
    name: true,
    names: extendedSpeciesNamesSelect,
  },
};

/**
 * Combined selector for Pokemon with complete species data
 * Includes all Pokemon data with embedded detailed species information
 */
// const spriteOnly = { id: true, name: true, sprite: true } as const;

const pokemonVarietySelect = {
  id: true,
  name: true,
  height: true,
  weight: true,
  baseExperience: true,
  order: true,
  isDefault: true,
  criesLatest: true,
  criesLegacy: true,
  sprites: extendedSpriteSelect,
  types: orderedTypeSelect,
  abilities: detailedAbilitySelect,
  stats: detailedStatSelect,
} satisfies Prisma.PokemonSelect;

// Lightweight species sub-tree
const speciesCoreSelect = {
  id: true,
  name: true,
  generationId: true,
  evolvesFromSpeciesId: true,
  evolutionChainId: true,
  colorId: true,
  shapeId: true,
  habitatId: true,
  genderRate: true,
  captureRate: true,
  baseHappiness: true,
  isBaby: true,
  hatchCounter: true,
  hasGenderDifferences: true,
  growthRateId: true,
  formsSwitchable: true,
  isLegendary: true,
  isMythical: true,
  order: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Top level detailed pokemon select with complete data
export const pokemonWithSpeciesSelect = {
  id: true,
  name: true,

  // Species with lightweight sub-tree
  pokemonSpecies: {
    select: {
      ...speciesCoreSelect,
      names: extendedSpeciesNamesSelect,
      flavorTexts: detailedFlavorTextSelect,
      generation: generationSelect,
      pokemonColor: pokemonColorSelect,
      pokemonShape: pokemonShapeSelect,
      pokemonHabitat: pokemonHabitatSelect,
      growthRate: growthRateSelect,
      eggGroups: eggGroupSelect,
      pokedexNumbers: detailedPokedexSelect,
      palParkEncounters: palParkEncountersSelect,
      evolvesFromSpecies: detailedEvolutionRelationshipsSelect,
      // varieties
      pokemon: {
        select: pokemonVarietySelect,
        orderBy: { order: 'asc' },
      },
      genderDetails: detailedGenderDetailsSelect,
    },
  },
} satisfies Prisma.PokemonSelect;

export const featuredPokemonSelect = {
  id: true,
  name: true,
  sprites: {
    select: {
      frontDefault: true,
    },
  },
  types: {
    select: {
      slot: true,
      type: {
        select: {
          id: true,
          name: true,
          names: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: { name: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { slot: 'asc' as const },
  },
  pokemonSpecies: {
    select: {
      flavorTexts: {
        where: { languageId: DEFAULT_LANGUAGE_ID },
        select: { flavorText: true },
        take: 1,
      },
    },
  },
} satisfies Prisma.PokemonSelect;

// New selector for Pokemon data without moves, optimized for flat structure
export const pokemonForTypeSelect = {
  select: {
    id: true,
    name: true,
    isDefault: true,
    order: true,
    pokemonSpeciesId: true,
    sprites: {
      select: {
        frontDefault: true,
        frontShiny: true,
      },
    },
    types: {
      select: {
        slot: true,
        type: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { slot: 'asc' as const },
    },
    abilities: {
      select: {
        slot: true,
        isHidden: true,
        ability: {
          select: {
            id: true,
            name: true,
            names: {
              where: { languageId: DEFAULT_LANGUAGE_ID },
              select: { name: true },
            },
          },
        },
      },
      orderBy: { slot: 'asc' as const },
    },
    stats: {
      select: {
        baseStat: true,
        stat: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { stat: { id: 'asc' as const } },
    },
  },
};

// Enhanced type selector for complete type information
export const completeTypeSelect = {
  select: {
    id: true,
    name: true,
    generationId: true,
    moveDamageClassId: true,
  },
};

export const pokemonFilter = {
  OR: [{ isDefault: true }, { name: { contains: '-' } }],
  NOT: {
    OR: [
      { name: { contains: '-gmax' } },
      { name: { contains: '-cap' } },
      { name: { contains: '-libre' } },
      { name: { contains: '-star' } },
      { name: { contains: '-cosplay' } },
      { name: { contains: '-starter' } },
      { name: { contains: '-belle' } },
      { name: { contains: '-phd' } },
      { name: { contains: '-starter' } },
      { name: { contains: '-totem' } },
      { name: { contains: '-gulping' } },
      { name: { contains: '-gorging' } },
      { name: { contains: '-mode' } },
      { name: { contains: '-build' } },
      { name: { contains: '-stellar' } },
      { name: { contains: '-terastral' } },
      { name: { contains: '-battle-bond' } },
    ],
  },
};
