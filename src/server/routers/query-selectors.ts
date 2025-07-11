import type { Prisma } from '@prisma/client';

const DEFAULT_LANGUAGE_ID = 9; // English

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
  varieties: varietiesSelect,
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

export const versionGroupSelect = {
  select: {
    id: true,
    name: true,
    generation: {
      select: {
        id: true,
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
  sprites: basicSpriteSelect,
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
  orderBy: { stat: { gameIndex: 'asc' as const } },
};

export const detailedFlavorTextSelect = {
  where: { languageId: DEFAULT_LANGUAGE_ID },
  select: {
    flavorText: true,
    version: {
      select: {
        id: true,
        name: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
        versionGroup: versionGroupSelect,
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
    { versionGroup: { order: 'desc' as const } },
    { moveLearnMethodId: 'asc' as const },
    { levelLearnedAt: 'asc' as const },
    { move: { name: 'asc' as const } },
  ],
};

export const detailedPokemonSelect = {
  id: true,
  name: true,
  height: true,
  weight: true,
  baseExperience: true,
  order: true,
  isDefault: true,
  criesLatest: true,
  criesLegacy: true,
  createdAt: true,
  updatedAt: true,
  // Basic sprite data
  sprites: extendedSpriteSelect,
  // Current types
  types: orderedTypeSelect,
  // Historical types by generation
  typePast: typePastSelect,
  // Current abilities
  abilities: detailedAbilitySelect,
  // Historical abilities by generation
  abilityPast: abilityPastSelect,
  // Base stats
  stats: detailedStatSelect,
  // All Pokemon forms
  forms: pokemonFormsSelect,
  // Comprehensive moveset
  moves: movesetSelect,

  // Game indices across versions
  gameIndices: {
    select: {
      gameIndex: true,
      version: {
        select: {
          id: true,
          name: true,
          names: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: { name: true },
          },
          versionGroup: versionGroupSelect,
        },
      },
    },
    orderBy: { version: { id: 'asc' as const } },
  },

  // Held items by version
  heldItems: {
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
      item: {
        select: {
          id: true,
          name: true,
          cost: true,
          flingPower: true,
          names: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: { name: true },
          },
          flavorTexts: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: { flavorText: true },
            take: 1,
          },
          sprite: true,
        },
      },
    },
    orderBy: [{ version: { id: 'asc' as const } }, { rarity: 'desc' as const }],
  },

  // Location encounters
  encounters: {
    select: {
      minLevel: true,
      maxLevel: true,
      chance: true,
      locationArea: {
        select: {
          id: true,
          name: true,
          gameIndex: true,
          names: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: { name: true },
          },
          location: {
            select: {
              id: true,
              name: true,
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
      },
      version: {
        select: {
          id: true,
          name: true,
        },
      },
      encounterMethod: {
        select: {
          id: true,
          name: true,
          order: true,
          names: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: { name: true },
          },
        },
      },
      conditionValueMap: {
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
      },
    },
    orderBy: [
      { locationArea: { location: { name: 'asc' as const } } },
      { minLevel: 'asc' as const },
    ],
  },

  // Species data with evolution and breeding info
  pokemonSpecies: defaultPokemonSpeciesSelect,
} satisfies Prisma.PokemonSelect;

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
