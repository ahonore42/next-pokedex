import { router, publicProcedure } from '../trpc';
import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import {
  defaultPokemonSelect,
  detailedPokemonSelect,
  detailedPokemonSpeciesSelect,
  evolutionSpeciesSelect,
  pokemonEvolutionsSelect,
  pokemonSearchSelect,
} from './query-selectors';
import type { inferRouterOutputs } from '@trpc/server';
import { evolutionChainsRouter } from './evolution-chains';

// Infer types directly from evolution-chains router
type EvolutionChainsOutputs = inferRouterOutputs<typeof evolutionChainsRouter>;
type EvolutionChainSingle = EvolutionChainsOutputs['all'][number];
type EvolutionSpecies = EvolutionChainSingle['pokemonSpecies'][number];

const DEFAULT_LANGUAGE_ID = 9; // English

// Type for species with evolution data (used in enhancement function)
type SpeciesWithEvolutions = {
  id: number;
  evolvesToSpecies: {
    pokemonEvolutions: {
      partySpeciesId: number | null;
      tradeSpeciesId: number | null;
    }[];
  }[];
};

type SpeciesEvolutionChain = {
  evolutionChain?: {
    pokemonSpecies: SpeciesWithEvolutions[];
  } | null;
};

// Type for evolution chain structure in detailed pokemon
type DetailedEvolutionChain = {
  pokemonSpecies: SpeciesWithEvolutions[];
};

// Type for pokemon with evolution chain
type PokemonWithEvolutionChain = {
  pokemonSpecies?: {
    evolutionChain?: DetailedEvolutionChain | null;
  } | null;
};

// Search result type
type PokemonSearchResult = {
  id: number;
  name: string;
  sprites: { frontDefault: string | null } | null;
  types: { type: { name: string } }[];
  pokemonSpecies: { id: number };
};
/**
 * Helper function to enhance evolution chain for species queries
 * Ensures every species has complete pokemonEvolutions data
 */
async function enhanceEvolutionChainForSpecies<T extends SpeciesEvolutionChain>(
  species: T,
): Promise<T> {
  const evolutionChain = species.evolutionChain;
  if (!evolutionChain) return species;

  // Collect required additional species IDs from evolution conditions
  const requiredSpeciesIds = new Set<number>();

  evolutionChain.pokemonSpecies.forEach((chainSpecies: SpeciesWithEvolutions) => {
    chainSpecies.evolvesToSpecies.forEach((evolvesTo) => {
      evolvesTo.pokemonEvolutions.forEach((evo) => {
        if (evo.partySpeciesId) requiredSpeciesIds.add(evo.partySpeciesId);
        if (evo.tradeSpeciesId) requiredSpeciesIds.add(evo.tradeSpeciesId);
      });
    });
  });

  // Cross-chain evolution detection
  const firstSpecies = evolutionChain.pokemonSpecies[0];
  if (!firstSpecies) return species;

  // Get evolution chain ID
  const speciesWithChain = await prisma.pokemonSpecies.findUnique({
    where: { id: firstSpecies.id },
    select: { evolutionChainId: true },
  });

  if (!speciesWithChain) return species;

  // Get all pokemon species in this evolution chain
  const chainSpecies = await prisma.pokemonSpecies.findMany({
    where: { evolutionChainId: speciesWithChain.evolutionChainId },
    orderBy: { order: 'asc' },
    select: evolutionSpeciesSelect,
  });

  if (!chainSpecies.length) return species;

  const speciesIdsInChain = chainSpecies.map((s) => s.id);
  const crossChainEvolutions: any[] = [];

  // Check for missing evolution targets and sources
  const missingEvolutionTargets = new Set<number>();
  const missingEvolutionSources = new Set<number>();

  chainSpecies.forEach((chainSpeciesItem) => {
    chainSpeciesItem.evolvesToSpecies.forEach((evolvesTo) => {
      const targetExists = chainSpecies.find((s) => s.id === evolvesTo.id);
      if (!targetExists) {
        missingEvolutionTargets.add(evolvesTo.id);
      }
    });

    if (chainSpeciesItem.evolvesFromSpecies) {
      const sourceExists = chainSpecies.find(
        (s) => s.id === chainSpeciesItem.evolvesFromSpecies!.id,
      );
      if (!sourceExists) {
        missingEvolutionSources.add(chainSpeciesItem.evolvesFromSpecies.id);
      }
    }
  });

  // Handle cross-chain evolutions
  if (missingEvolutionTargets.size > 0 || missingEvolutionSources.size > 0) {
    if (missingEvolutionSources.size > 0) {
      const crossChainSources = await prisma.pokemonSpecies.findMany({
        where: {
          id: { in: Array.from(missingEvolutionSources) },
          evolutionChainId: { not: speciesWithChain.evolutionChainId },
        },
        select: {
          ...evolutionSpeciesSelect,
          evolutionChainId: true,
        },
      });

      crossChainSources.forEach((sourceSpecies) => {
        const evolvesToSpecies = chainSpecies.find(
          (s) => s.evolvesFromSpecies?.id === sourceSpecies.id,
        );
        const speciesName = (species as any).name || chainSpecies[0]?.name || 'Unknown Species';
        console.log(
          `Cross-chain evolution source found for ${speciesName}: ${sourceSpecies.name} (chain ${sourceSpecies.evolutionChainId}) evolves to ${evolvesToSpecies?.name} (chain ${speciesWithChain.evolutionChainId})`,
        );
        requiredSpeciesIds.add(sourceSpecies.id);
      });

      crossChainEvolutions.push(...crossChainSources);
    }

    if (missingEvolutionTargets.size > 0) {
      const crossChainTargets = await prisma.pokemonSpecies.findMany({
        where: {
          evolvesFromSpeciesId: { in: speciesIdsInChain },
          evolutionChainId: { not: speciesWithChain.evolutionChainId },
          id: { in: Array.from(missingEvolutionTargets) },
        },
        select: {
          ...evolutionSpeciesSelect,
          evolvesFromSpeciesId: true,
          evolutionChainId: true,
        },
      });

      crossChainTargets.forEach((targetSpecies) => {
        const evolvesFromSpecies = chainSpecies.find(
          (s) => s.id === targetSpecies.evolvesFromSpeciesId,
        );
        const speciesName = (species as any).name || chainSpecies[0]?.name || 'Unknown Species';
        console.log(
          `Cross-chain evolution target found for ${speciesName}: ${targetSpecies.name} (chain ${targetSpecies.evolutionChainId}) evolves from ${evolvesFromSpecies?.name} (chain ${speciesWithChain.evolutionChainId})`,
        );
        requiredSpeciesIds.add(targetSpecies.id);
      });

      crossChainEvolutions.push(...crossChainTargets);
    }
  }

  // Fetch additional species
  const additionalSpecies: EvolutionSpecies[] =
    requiredSpeciesIds.size > 0
      ? await prisma.pokemonSpecies.findMany({
          where: {
            id: { in: Array.from(requiredSpeciesIds) },
          },
          select: evolutionSpeciesSelect,
        })
      : [];

  // Combine all species
  const allSpecies = [...chainSpecies, ...additionalSpecies, ...crossChainEvolutions];
  const allSpeciesIds = allSpecies.map((s) => s.id);

  // Fetch evolution data where pokemonSpeciesId is the TARGET species
  const evolutionRecords = await prisma.pokemonEvolution.findMany({
    where: {
      pokemonSpeciesId: { in: allSpeciesIds },
    },
    ...pokemonEvolutionsSelect,
  });

  // Map evolution conditions to SOURCE species
  const evolutionsBySourceSpecies = new Map<number, any[]>();

  evolutionRecords.forEach((evolution) => {
    const { pokemonSpeciesId: targetSpeciesId, ...evolutionConditions } = evolution;

    // Find which species evolves TO this target
    const sourceSpecies = allSpecies.find((s: any) =>
      s.evolvesToSpecies?.some((evolvesTo: any) => evolvesTo.id === targetSpeciesId),
    );

    if (sourceSpecies) {
      if (!evolutionsBySourceSpecies.has(sourceSpecies.id)) {
        evolutionsBySourceSpecies.set(sourceSpecies.id, []);
      }
      evolutionsBySourceSpecies.get(sourceSpecies.id)!.push(evolutionConditions);
    }
  });

  // Enhance each species with correct pokemonEvolutions
  const enhancedSpecies = allSpecies.map((speciesItem: any) => ({
    ...speciesItem,
    pokemonEvolutions: evolutionsBySourceSpecies.get(speciesItem.id) || [],
  }));

  // Remove duplicates
  const uniqueSpecies = Array.from(new Map(enhancedSpecies.map((s: any) => [s.id, s])).values());

  return {
    ...species,
    evolutionChain: {
      ...evolutionChain,
      pokemonSpecies: uniqueSpecies,
    },
  } as T;
}
/**
 * Helper function to enhance evolution chain with additional species (for use in resolvers)
 */
export async function enhanceEvolutionChainWithAdditionalSpecies<
  T extends PokemonWithEvolutionChain,
>(pokemon: T): Promise<T> {
  const evolutionChain = pokemon.pokemonSpecies?.evolutionChain;
  if (!evolutionChain) return pokemon;

  // Collect required additional species IDs from evolution conditions
  const requiredSpeciesIds = new Set<number>();

  evolutionChain.pokemonSpecies.forEach((species: SpeciesWithEvolutions) => {
    species.evolvesToSpecies.forEach((evolvesTo) => {
      evolvesTo.pokemonEvolutions.forEach((evo) => {
        if (evo.partySpeciesId) requiredSpeciesIds.add(evo.partySpeciesId);
        if (evo.tradeSpeciesId) requiredSpeciesIds.add(evo.tradeSpeciesId);
      });
    });
  });

  // Cross-chain evolution detection (like Meltan → Melmetal)
  // Get the evolution chain ID from the first species in the chain
  const firstSpecies = evolutionChain.pokemonSpecies[0];
  if (!firstSpecies) return pokemon;

  // Find the evolution chain ID by querying for the first species
  const speciesWithChain = await prisma.pokemonSpecies.findUnique({
    where: { id: firstSpecies.id },
    select: { evolutionChainId: true },
  });

  if (!speciesWithChain) return pokemon;

  // Get all pokemon species in this evolution chain
  const chainSpecies = await prisma.pokemonSpecies.findMany({
    where: { evolutionChainId: speciesWithChain.evolutionChainId },
    orderBy: { order: 'asc' },
    select: evolutionSpeciesSelect,
  });

  if (!chainSpecies.length) return pokemon;

  const speciesIdsInChain = chainSpecies.map((s) => s.id);
  const crossChainEvolutions: any[] = [];

  // Check if any evolvesToSpecies are missing from the current chain
  const missingEvolutionTargets = new Set<number>();
  chainSpecies.forEach((species) => {
    species.evolvesToSpecies.forEach((evolvesTo) => {
      const targetExists = chainSpecies.find((s) => s.id === evolvesTo.id);
      if (!targetExists) {
        missingEvolutionTargets.add(evolvesTo.id);
      }
    });
  });

  // Also check if any evolvesFromSpecies are missing from the current chain
  const missingEvolutionSources = new Set<number>();
  chainSpecies.forEach((species) => {
    if (species.evolvesFromSpecies) {
      const sourceExists = chainSpecies.find((s) => s.id === species.evolvesFromSpecies!.id);
      if (!sourceExists) {
        missingEvolutionSources.add(species.evolvesFromSpecies.id);
      }
    }
  });

  // Look for cross-chain evolutions if we have missing targets OR sources
  if (missingEvolutionTargets.size > 0 || missingEvolutionSources.size > 0) {
    // Find Pokemon that evolve TO species in this chain but are in different chains (evolution sources)
    if (missingEvolutionSources.size > 0) {
      const crossChainSources = await prisma.pokemonSpecies.findMany({
        where: {
          id: { in: Array.from(missingEvolutionSources) },
          evolutionChainId: { not: speciesWithChain.evolutionChainId }, // Different chain
        },
        select: {
          ...evolutionSpeciesSelect,
          evolutionChainId: true,
        },
      });

      crossChainSources.forEach((species) => {
        const evolvesToSpecies = chainSpecies.find((s) => s.evolvesFromSpecies?.id === species.id);
        const pokemonName =
          (pokemon as any).name ||
          (pokemon.pokemonSpecies as any)?.name ||
          chainSpecies[0]?.name ||
          'Unknown Pokemon';
        console.log(
          `Cross-chain evolution source found for ${pokemonName}: ${species.name} (chain ${species.evolutionChainId}) evolves to ${evolvesToSpecies?.name} (chain ${speciesWithChain.evolutionChainId})`,
        );
        requiredSpeciesIds.add(species.id);
      });

      crossChainEvolutions.push(...crossChainSources);
    }

    // Find Pokemon that evolve FROM species in this chain but are in different chains (evolution targets)
    if (missingEvolutionTargets.size > 0) {
      const crossChainTargets = await prisma.pokemonSpecies.findMany({
        where: {
          evolvesFromSpeciesId: { in: speciesIdsInChain },
          evolutionChainId: { not: speciesWithChain.evolutionChainId }, // Different chain
          id: { in: Array.from(missingEvolutionTargets) }, // Only missing targets
        },
        select: {
          ...evolutionSpeciesSelect,
          evolvesFromSpeciesId: true,
          evolutionChainId: true,
        },
      });

      crossChainTargets.forEach((species) => {
        const evolvesFromSpecies = chainSpecies.find((s) => s.id === species.evolvesFromSpeciesId);
        const pokemonName =
          (pokemon as any).name ||
          (pokemon.pokemonSpecies as any)?.name ||
          chainSpecies[0]?.name ||
          'Unknown Pokemon';
        console.log(
          `Cross-chain evolution target found for ${pokemonName}: ${species.name} (chain ${species.evolutionChainId}) evolves from ${evolvesFromSpecies?.name} (chain ${speciesWithChain.evolutionChainId})`,
        );
        requiredSpeciesIds.add(species.id);
      });

      crossChainEvolutions.push(...crossChainTargets);
    }
  }

  // Only fetch additional species if there are any required
  if (requiredSpeciesIds.size === 0 && crossChainEvolutions.length === 0) return pokemon;

  const additionalSpecies: EvolutionSpecies[] = await prisma.pokemonSpecies.findMany({
    where: {
      id: { in: Array.from(requiredSpeciesIds) },
    },
    select: evolutionSpeciesSelect,
  });

  // Use the chain species data with cross-chain evolutions
  const finalSpecies = [...chainSpecies, ...additionalSpecies, ...crossChainEvolutions];
  const uniqueSpecies = Array.from(new Map(finalSpecies.map((s: any) => [s.id, s])).values());

  return {
    ...pokemon,
    pokemonSpecies: {
      ...pokemon.pokemonSpecies,
      evolutionChain: {
        ...evolutionChain,
        pokemonSpecies: uniqueSpecies,
      },
    },
  } as T;
}

/**
 * Fetches a single Pokemon record from the database.
 * @param where - The unique identifier for the Pokemon (e.g., { id: 1 } or { name: 'bulbasaur' }).
 * @param select - The Prisma select object to specify which fields to return.
 * @returns The Pokemon object.
 * @throws {TRPCError} with code 'NOT_FOUND' if the Pokemon is not found.
 */
async function findOnePokemon(
  where: Prisma.PokemonWhereUniqueInput,
): Promise<Prisma.PokemonGetPayload<{ select: typeof detailedPokemonSelect }>> {
  const pokemon = await prisma.pokemon.findUnique({
    where,
    select: detailedPokemonSelect,
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

/**
 * Fetches a single Pokemon Species record from the database with all associated Pokemon.
 * @param where - The unique identifier for the Pokemon Species (e.g., { id: 1 } or { name: 'bulbasaur' }).
 * @returns The Pokemon Species object with all associated Pokemon records.
 * @throws {TRPCError} with code 'NOT_FOUND' if the Pokemon Species is not found.
 */
async function findOnePokemonSpecies(
  where: Prisma.PokemonSpeciesWhereUniqueInput,
): Promise<Prisma.PokemonSpeciesGetPayload<{ select: typeof detailedPokemonSpeciesSelect }>> {
  const pokemonSpecies = await prisma.pokemonSpecies.findUnique({
    where,
    select: detailedPokemonSpeciesSelect,
  });

  if (!pokemonSpecies) {
    const identifier = JSON.stringify(where);
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No Pokemon Species found with criteria: ${identifier}`,
    });
  }
  return pokemonSpecies;
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
          id: 'asc',
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
      return findOnePokemon({ id: input.id });
    }),

  detailedById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const pokemon = await findOnePokemon({ id: input.id });

      // Enhance evolution chain with additional species if needed
      return await enhanceEvolutionChainWithAdditionalSpecies(pokemon);
    }),

  byName: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(({ input }) => {
      return findOnePokemon({ name: input.name });
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
        pokedexName: z.string().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 50;
      const { cursor, pokedexId, pokedexName } = input;

      let resolvedPokedexId: number | undefined;

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
            name: true,
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

      // Step 1: Fetch PokemonSpeciesPokedexNumber records for the target Pokedex
      const orderedPokedexEntries = await prisma.pokemonSpeciesPokedexNumber.findMany({
        where: {
          pokedexId: resolvedPokedexId,
          ...(cursor && {
            pokedexNumber: { gt: cursor },
          }),
        },
        orderBy: {
          pokedexNumber: 'asc',
        },
        select: {
          pokemonSpeciesId: true,
          pokedexNumber: true,
        },
        take: limit + 1,
      });

      // Extract ordered species IDs and their corresponding pokedex numbers
      const orderedPokemonSpeciesIds = orderedPokedexEntries.map((entry) => entry.pokemonSpeciesId);
      const pokedexNumberMap = new Map<number, number>();
      orderedPokedexEntries.forEach((item) => {
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
        select: finalSelect,
      });

      // Step 3: Sort the fetched pokemonList based on the order of orderedPokemonSpeciesIds
      const sortedPokemonList = orderedPokemonSpeciesIds
        .map((speciesId) => pokemonList.find((p) => p.pokemonSpecies.id === speciesId))
        .filter((pokemon): pokemon is NonNullable<typeof pokemon> => pokemon !== undefined);

      let nextCursor: typeof cursor | undefined = undefined;
      if (sortedPokemonList.length > limit) {
        const nextItem = sortedPokemonList.pop()!;
        nextCursor = pokedexNumberMap.get(nextItem.pokemonSpecies.id);
      }

      return {
        pokemon: sortedPokemonList,
        nextCursor,
      };
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

      const results: PokemonSearchResult[] = await prisma.pokemon.findMany({
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
  speciesById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const species = await findOnePokemonSpecies({ id: input.id });

      // Enhance evolution chain with additional species if needed
      return await enhanceEvolutionChainForSpecies(species);
    }),

  speciesByName: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const species = await findOnePokemonSpecies({ name: input.name });

      // Enhance evolution chain with additional species if needed
      return await enhanceEvolutionChainForSpecies(species);
    }),
});
