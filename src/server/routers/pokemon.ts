import { router, publicProcedure } from '../trpc';
import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import {
  defaultPokemonSelect,
  evolutionSpeciesSelect,
  officialArtworkSelect,
  pokemonSearchSelect,
  pokemonWithSpeciesSelect,
  featuredPokemonSelect,
  movesetSelect,
  detailedEncounterSelect,
} from './selectors';
import type { inferRouterOutputs } from '@trpc/server';
import { evolutionChainsRouter } from './evolution-chains';
import { significantPokemonIds } from '~/utils/pokemon';

// Infer types directly from evolution-chains router
type EvolutionChainsOutputs = inferRouterOutputs<typeof evolutionChainsRouter>;
type EvolutionChainSingle = EvolutionChainsOutputs['all'][number];
type EvolutionSpecies = EvolutionChainSingle['pokemonSpecies'][number];

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
 * Fetches a single Pokemon record with complete species data from the database.
 * @param where - The unique identifier for the Pokemon (e.g., { id: 1 } or { name: 'bulbasaur' }).
 * @returns The Pokemon object with complete embedded species data.
 * @throws {TRPCError} with code 'NOT_FOUND' if the Pokemon is not found.
 */
async function findOnePokemonWithSpecies(
  where: Prisma.PokemonWhereUniqueInput,
): Promise<Prisma.PokemonGetPayload<{ select: typeof pokemonWithSpeciesSelect }>> {
  const pokemon = await prisma.pokemon.findUnique({
    where,
    select: pokemonWithSpeciesSelect,
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
  featured: publicProcedure.query(async () => {
    const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));

    const seedRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const WINDOW = 6;
    // Compute only the last WINDOW + 6 hours so the used-set is well-primed
    // before the live window — O(12) instead of O(hours-since-epoch).
    const LOOKBACK = WINDOW * 2;
    const startHour = Math.max(0, currentHour - LOOKBACK);

    const queue: number[] = [];
    const used = new Set<number>();

    for (let hour = startHour; hour <= currentHour; hour++) {
      if (queue.length >= WINDOW) {
        const removedId = queue.shift()!;
        used.delete(removedId);
      }

      let pokemonId: number;
      let attempts = 0;
      do {
        const randomIndex = Math.floor(
          seedRandom(12345 + hour + attempts * 1000) * significantPokemonIds.length,
        );
        pokemonId = significantPokemonIds[randomIndex];
        attempts++;
      } while (used.has(pokemonId) && attempts < 100);

      used.add(pokemonId);
      queue.push(pokemonId);
    }

    const pokemon = await prisma.pokemon.findMany({
      where: { id: { in: queue } },
      select: featuredPokemonSelect,
    });

    // Return pokemon in queue order
    return queue.map((id) => pokemon.find((p) => p.id === id)).filter(Boolean) as typeof pokemon;
  }),
  pokemonWithSpecies: publicProcedure
    .input(
      z.union([
        z.object({
          id: z.number().int().positive(),
          name: z.undefined(),
        }),
        z.object({
          id: z.undefined(),
          name: z.string().min(1).max(50),
        }),
      ]),
    )
    .query(async ({ input }) => {
      // Determine the where clause based on input
      const where: Prisma.PokemonWhereUniqueInput = input.id
        ? { id: input.id }
        : { name: input.name?.toLowerCase() };

      try {
        return await findOnePokemonWithSpecies(where);
      } catch (error) {
        // Re-throw TRPCError as-is, convert others to TRPCError
        if (error instanceof TRPCError) {
          throw error;
        }

        const identifier = input.id ? `id: ${input.id}` : `name: ${input.name}`;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch Pokemon with criteria: ${identifier}`,
          cause: error,
        });
      }
    }),
  officialArtworkByNames: publicProcedure
    .input(
      z.object({
        names: z.array(z.string().min(1)).min(1).max(50),
      }),
    )
    .query(async ({ input }) => {
      const { names } = input;

      // Normalize names to lowercase for consistent matching
      const normalizedNames = names.map((name) => name.trim().toLowerCase());

      const pokemon = await prisma.pokemon.findMany({
        where: {
          name: {
            in: normalizedNames,
            mode: 'insensitive',
          },
        },
        select: officialArtworkSelect,
        orderBy: {
          name: 'asc',
        },
      });

      const artwork = pokemon.map((pkmn) => pkmn.sprites?.officialArtworkFront);

      return artwork;
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

  moveset: publicProcedure
    .input(z.object({ pokemonId: z.number().int(), generationId: z.number().int() }))
    .query(async ({ input }) => {
      return await prisma.move.findMany({
        where: {
          pokemonMoves: {
            some: {
              pokemonId: input.pokemonId,
              versionGroup: { generationId: input.generationId },
            },
          },
        },
        select: {
          id: true,
          name: true,
          names: { where: { languageId: 9 }, select: { name: true } },
          type: {
            select: {
              name: true,
              names: { where: { languageId: 9 }, select: { name: true } },
            },
          },
          moveDamageClass: { select: { name: true } },
          power: true,
          accuracy: true,
          pp: true,
          flavorTexts: {
            where: { languageId: 9 },
            select: { flavorText: true },
            orderBy: { versionGroupId: 'desc' as const },
            take: 1,
          },
          effectEntries: {
            where: { languageId: 9 },
            select: { shortEffect: true },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      });
    }),

  // Full learnset for a single Pokémon (all versions/methods) — used by the detail page
  movesForPokemon: publicProcedure
    .input(z.object({ pokemonId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return await prisma.pokemonMove.findMany({
        where: { pokemonId: input.pokemonId },
        select: movesetSelect.select,
        orderBy: movesetSelect.orderBy,
      });
    }),

  // All wild encounters for a single Pokémon — used by the detail page
  encountersForPokemon: publicProcedure
    .input(z.object({ pokemonId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return await prisma.pokemonEncounter.findMany({
        where: { pokemonId: input.pokemonId },
        select: detailedEncounterSelect.select,
        orderBy: detailedEncounterSelect.orderBy,
      });
    }),
});
