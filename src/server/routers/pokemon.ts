import { router, publicProcedure } from '../trpc';
import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';

const DEFAULT_LANGUAGE_ID = 9; // English

/**
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */

const defaultPokemonSelect = {
  id: true,
  name: true,
  height: true,
  weight: true,
  baseExperience: true,
  isDefault: true,
  criesLatest: true,
  criesLegacy: true,
  sprites: {
    select: {
      frontDefault: true,
      frontShiny: true,
      backDefault: true,
      backShiny: true,
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
          },
        },
      },
    },
  },
  abilities: {
    select: {
      slot: true,
      isHidden: true,
      ability: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  stats: {
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
  },
  pokemonSpecies: {
    select: {
      id: true,
      flavorTexts: {
        where: {
          languageId: DEFAULT_LANGUAGE_ID,
        },
        select: {
          flavorText: true,
        },
      },
      pokedexNumbers: {
        select: {
          pokedexNumber: true,
          pokedex: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.PokemonSelect;

const detailedPokemonSelect = {
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
  sprites: {
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
  },

  // Current types
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
          },
        },
      },
    },
    orderBy: { slot: 'asc' },
  },

  // Historical types by generation
  typePast: {
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
    orderBy: [{ generationId: 'asc' }, { slot: 'asc' }],
  },

  // Current abilities
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
          flavorTexts: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: { flavorText: true },
            orderBy: { versionGroupId: 'desc' },
            take: 1,
          },
          effectTexts: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: {
              effect: true,
              shortEffect: true,
            },
            take: 1,
          },
        },
      },
    },
    orderBy: { slot: 'asc' },
  },

  // Historical abilities by generation
  abilityPast: {
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
    orderBy: [{ generationId: 'asc' }, { slot: 'asc' }],
  },

  // Base stats
  stats: {
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
    orderBy: { stat: { gameIndex: 'asc' } },
  },

  // All Pokemon forms
  forms: {
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
      types: {
        select: {
          slot: true,
          type: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { slot: 'asc' },
      },
      sprites: {
        select: {
          frontDefault: true,
          frontShiny: true,
          backDefault: true,
          backShiny: true,
        },
      },
    },
    orderBy: { formOrder: 'asc' },
  },

  // Comprehensive moveset
  moves: {
    select: {
      levelLearnedAt: true,
      order: true,
      versionGroup: {
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
        },
      },
      moveLearnMethod: {
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
      },
      move: {
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
          type: {
            select: {
              id: true,
              name: true,
            },
          },
          moveDamageClass: {
            select: {
              id: true,
              name: true,
              names: {
                where: { languageId: DEFAULT_LANGUAGE_ID },
                select: { name: true },
              },
            },
          },
          effectEntries: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: {
              effect: true,
              shortEffect: true,
            },
            take: 1,
          },
          flavorTexts: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: { flavorText: true },
            orderBy: { versionGroupId: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: [
      { versionGroup: { order: 'desc' } },
      { moveLearnMethodId: 'asc' },
      { levelLearnedAt: 'asc' },
      { move: { name: 'asc' } },
    ],
  },

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
          versionGroup: {
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
          },
        },
      },
    },
    orderBy: { version: { id: 'asc' } },
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
    orderBy: [{ version: { id: 'asc' } }, { rarity: 'desc' }],
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
    orderBy: [{ locationArea: { location: { name: 'asc' } } }, { minLevel: 'asc' }],
  },

  // Species data with evolution and breeding info
  pokemonSpecies: {
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
      names: {
        where: { languageId: DEFAULT_LANGUAGE_ID },
        select: {
          name: true,
          genus: true,
        },
      },

      // Flavor texts (Pokedex entries)
      flavorTexts: {
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
              versionGroup: {
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
              },
            },
          },
        },
        orderBy: { version: { id: 'desc' } },
      },

      // Generation info
      generation: {
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
      },

      // Color
      pokemonColor: {
        select: {
          id: true,
          name: true,
          names: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: { name: true },
          },
        },
      },

      // Shape
      pokemonShape: {
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
      },

      // Habitat
      pokemonHabitat: {
        select: {
          id: true,
          name: true,
          names: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: { name: true },
          },
        },
      },

      // Growth rate
      growthRate: {
        select: {
          id: true,
          name: true,
          formula: true,
          descriptions: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: { description: true },
          },
        },
      },

      // Egg groups
      eggGroups: {
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
      },

      // Evolution chain
      evolutionChain: {
        select: {
          id: true,
          babyTriggerItem: {
            select: {
              id: true,
              name: true,
              names: {
                where: { languageId: DEFAULT_LANGUAGE_ID },
                select: { name: true },
              },
            },
          },
          // Get all species in this evolution chain
          pokemonSpecies: {
            select: {
              id: true,
              name: true,
              order: true,
              names: {
                where: { languageId: DEFAULT_LANGUAGE_ID },
                select: { name: true },
              },
              // Get varieties (different forms) for each species
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
                      types: {
                        select: {
                          slot: true,
                          type: {
                            select: {
                              id: true,
                              name: true,
                            },
                          },
                        },
                        orderBy: { slot: 'asc' },
                      },
                    },
                  },
                },
                where: { isDefault: true },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      },

      // Pokedex numbers
      pokedexNumbers: {
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
        orderBy: [{ pokedex: { isMainSeries: 'desc' } }, { pokedex: { id: 'asc' } }],
      },

      // Pal Park encounters
      palParkEncounters: {
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
      },
    },
  },
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

/**
 * Fetches a single Pokemon record from the database.
 * @param where - The unique identifier for the Pokemon (e.g., { id: 1 } or { name: 'bulbasaur' }).
 * @param select - The Prisma select object to specify which fields to return.
 * @returns The Pokemon object.
 * @throws {TRPCError} with code 'NOT_FOUND' if the Pokemon is not found.
 */
async function findOnePokemon<T extends Prisma.PokemonSelect>(
  where: Prisma.PokemonWhereUniqueInput,
  select: T,
) {
  const pokemon = await prisma.pokemon.findUnique({
    where,
    select,
  });

  if (!pokemon) {
    const identifier = JSON.stringify(where);
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No Pokemon found with criteria: ${identifier}`,
    });
  }
  return pokemon;
}

export const pokemonRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      const pokemonList = await prisma.pokemon.findMany({
        select: defaultPokemonSelect,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          id: 'asc', // Order by ID for consistent pagination
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (pokemonList.length > limit) {
        const nextItem = pokemonList.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        pokemon: pokemonList,
        nextCursor,
      };
    }),
  byId: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(({ input }) => {
      return findOnePokemon({ id: input.id }, defaultPokemonSelect);
    }),
  detailedById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(({ input }) => {
      return findOnePokemon({ id: input.id }, detailedPokemonSelect);
    }),
  byName: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(({ input }) => {
      return findOnePokemon({ name: input.name }, defaultPokemonSelect);
    }),
  allTypes: publicProcedure.query(async () => {
    return await prisma.type.findMany({
      where: {
        name: {
          notIn: ['shadow', 'unknown', 'stellar'],
        },
      },
      select: {
        id: true,
        name: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }),
  featured: publicProcedure.query(async () => {
    // 1. Get a pool of recently updated Pokémon
    const recentPokemon = await prisma.pokemon.findMany({
      select: { id: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
    const pokemonPoolIds = recentPokemon.map((p) => p.id);

    // 2. Use a daily seed to select from the pool
    const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Days since epoch
    const dailySelectionIds = Array.from(
      { length: 6 },
      (_, i) => pokemonPoolIds[(seed + i) % pokemonPoolIds.length],
    );

    // 3. Fetch the full data for the selected Pokémon
    const pokemon = await prisma.pokemon.findMany({
      where: { id: { in: dailySelectionIds } },
      select: defaultPokemonSelect,
    });

    return { pokemon, date: new Date().toISOString().split('T')[0] };
  }),
  allRegions: publicProcedure.query(async () => {
    return await prisma.region.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }),
  pokemonByPokedex: publicProcedure
    .input(
      z.object({
        pokedexId: z.number().optional(),
        pokedexName: z.string().optional(), // Added pokedexName
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 50;
      const { cursor, pokedexId, pokedexName } = input;

      let resolvedPokedexId: number | undefined; // Initialize as undefined

      if (pokedexId) {
        resolvedPokedexId = pokedexId;
      } else if (pokedexName) {
        // Resolve pokedexName to pokedexId
        const namedPokedex = await prisma.pokedex.findUnique({
          where: { name: pokedexName },
          select: { id: true },
        });
        if (!namedPokedex) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Pokedex '${pokedexName}' not found.`,
          });
        }
        resolvedPokedexId = namedPokedex.id;
      }

      // If no specific pokedex is requested, return empty list
      if (!resolvedPokedexId) {
        return { pokemon: [], nextCursor: undefined };
      }

      const finalSelect: Prisma.PokemonSelect = {
        id: true,
        name: true,
        height: true,
        weight: true,
        baseExperience: true,
        isDefault: true,
        criesLatest: true,
        criesLegacy: true,
        sprites: defaultPokemonSelect.sprites,
        types: defaultPokemonSelect.types,
        abilities: defaultPokemonSelect.abilities,
        stats: defaultPokemonSelect.stats,
        pokemonSpecies: {
          select: {
            id: true,
            flavorTexts: defaultPokemonSelect.pokemonSpecies.select.flavorTexts,
            pokedexNumbers: {
              select: {
                pokedexNumber: true,
                pokedex: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              where: {
                pokedexId: resolvedPokedexId,
              },
            },
          },
        },
      };

      // Step 1: Fetch PokemonSpeciesPokedexNumber records for the target Pokedex, ordered by pokedexNumber
      // This is the primary query for ordering and pagination.
      const orderedPokedexEntries = await prisma.pokemonSpeciesPokedexNumber.findMany({
        where: {
          pokedexId: resolvedPokedexId,
          ...(cursor && {
            pokedexNumber: { gt: cursor }, // For cursor-based pagination
          }),
        },
        orderBy: {
          pokedexNumber: 'asc',
        },
        select: {
          pokemonSpeciesId: true,
          pokedexNumber: true,
        },
        take: limit + 1, // Fetch one extra for the next cursor
      });

      // Extract ordered species IDs and their corresponding pokedex numbers
      const orderedPokemonSpeciesIds = orderedPokedexEntries.map(entry => entry.pokemonSpeciesId);
      const pokedexNumberMap = new Map<number, number>();
      orderedPokedexEntries.forEach(item => {
        pokedexNumberMap.set(item.pokemonSpeciesId, item.pokedexNumber);
      });

      // If no entries found, return empty
      if (orderedPokemonSpeciesIds.length === 0) {
        return { pokemon: [], nextCursor: undefined };
      }

      // Step 2: Fetch Pokemon records based on the ordered species IDs
      const pokemonList = await prisma.pokemon.findMany({
        where: {
          pokemonSpeciesId: { in: orderedPokemonSpeciesIds },
        },
        select: finalSelect, // Use the finalSelect to get all required data
      });

      // Step 3: Sort the fetched pokemonList in memory based on the order of orderedPokemonSpeciesIds
      // This is crucial because `in` operator does not guarantee order
      const sortedPokemonList = orderedPokemonSpeciesIds.map(speciesId =>
        pokemonList.find(p => p.pokemonSpecies.id === speciesId)
      ).filter(Boolean) as typeof pokemonList; // Filter out any undefined and assert type

      let nextCursor: typeof cursor | undefined = undefined;
      if (sortedPokemonList.length > limit) {
        const nextItem = sortedPokemonList.pop()!;
        nextCursor = pokedexNumberMap.get(nextItem.pokemonSpecies.id); // Use the pokedexNumber of the last item as cursor
      }

      return {
        pokemon: sortedPokemonList,
        nextCursor,
      }
    }),
  pokemonSpeciesPokedexNumbers: publicProcedure
    .input(
      z.object({
        pokemonSpeciesId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const { pokemonSpeciesId } = input;
      const pokedexNumbers = await prisma.pokemonSpeciesPokedexNumber.findMany({
        where: { pokemonSpeciesId },
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
            },
          },
        },
        orderBy: { pokedexNumber: 'asc' },
      });
      return pokedexNumbers;
    }),
  allPokedexes: publicProcedure.query(async () => {
    return await prisma.pokedex.findMany({
      select: {
        id: true,
        name: true,
        isMainSeries: true,
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
      orderBy: {
        id: 'asc',
      },
    });
  }),
  dbStats: publicProcedure.query(async () => {
    const [pokemonSpeciesCount, typesCount, generationsCount, movesCount] = await Promise.all([
      prisma.pokemonSpecies.count(),
      prisma.type.count(),
      prisma.generation.count(),
      prisma.move.count(),
    ]);

    return {
      pokemonSpecies: pokemonSpeciesCount,
      types: typesCount,
      generations: generationsCount,
      moves: movesCount,
    };
  }),
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(50),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ input }) => {
      const { query, limit } = input;
      const searchTerm = query.trim().toLowerCase();

      if (!searchTerm) {
        return { pokemon: [] };
      }

      const results = await prisma.pokemon.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        select: pokemonSearchSelect,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      });

      // Move the exact match to the top of the list if it's not already there
      const exactMatchIndex = results.findIndex((p) => p.name.toLowerCase() === searchTerm);

      if (exactMatchIndex > 0) {
        const exactMatch = results.splice(exactMatchIndex, 1)[0];
        results.unshift(exactMatch);
      }

      return {
        pokemon: results,
        query: searchTerm,
        limit,
      };
    }),
});
