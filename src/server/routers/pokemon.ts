import { router, publicProcedure } from '../trpc';
import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import {
  basicTypeSelect,
  defaultPokemonSelect,
  evolutionSpeciesSelect,
  officialArtworkSelect,
  pokemonSearchSelect,
  pokemonWithSpeciesSelect,
  featuredPokemonSelect,
} from './selectors';
import type { inferRouterOutputs } from '@trpc/server';
import { evolutionChainsRouter } from './evolution-chains';
import { significantPokemonIds } from '~/utils/pokemon';

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

    const queue: number[] = [];
    const used = new Set<number>();

    // Simulate queue state up to current hour
    for (let hour = 0; hour <= currentHour; hour++) {
      // Only create initial queue if queue is empty
      if (queue.length === 0) {
        // Create initial queue of 6 pokemon
        for (let i = 0; i < 6; i++) {
          let pokemonId: number;
          let attempts = 0;
          do {
            const randomIndex = Math.floor(
              seedRandom(12345 + i + attempts * 1000) * significantPokemonIds.length,
            );
            pokemonId = significantPokemonIds[randomIndex];
            attempts++;
          } while (used.has(pokemonId) && attempts < 100);

          used.add(pokemonId);
          queue.push(pokemonId);
        }
      } else {
        // Pop one pokemon and add a new one
        const removedId = queue.shift();
        if (removedId) {
          used.delete(removedId);
        }

        let newPokemonId: number;
        let attempts = 0;
        do {
          const randomIndex = Math.floor(
            seedRandom(12345 + hour + attempts * 1000) * significantPokemonIds.length,
          );
          newPokemonId = significantPokemonIds[randomIndex];
          attempts++;
        } while (used.has(newPokemonId) && attempts < 100);

        used.add(newPokemonId);
        queue.push(newPokemonId);
      }
    }

    // Query the current queue pokemon
    const pokemon = await prisma.pokemon.findMany({
      where: {
        id: { in: queue },
      },
      select: featuredPokemonSelect,
    });

    // Return pokemon in queue order
    return pokemon;
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
        // Get Pokemon with complete species data
        const pokemon = await findOnePokemonWithSpecies(where);

        // Apply evolution chain enhancement to preserve existing logic
        const enhancedPokemon = await enhanceEvolutionChainWithAdditionalSpecies(pokemon);

        return enhancedPokemon;
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

  pokedexByGeneration: publicProcedure.query(async () => {
    // National Pokedex
    const nationalPokedex = await prisma.pokedex.findUnique({
      where: { name: 'national' },
      select: {
        id: true,
        name: true,
      },
    });
    if (!nationalPokedex) return null;

    // One bulk species query ordered by id ASC
    const allSpecies = await prisma.pokemonSpecies.findMany({
      where: {
        pokedexNumbers: {
          some: { pokedex: { name: 'national' } },
        },
      },
      select: {
        id: true,
        name: true,
        order: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
          take: 1,
        },
        generation: {
          select: { name: true, id: true },
        },
        pokemon: {
          where: { isDefault: true },
          select: {
            name: true,
            types: basicTypeSelect,
            sprites: { select: { frontDefault: true } },
          },
        },
        pokedexNumbers: {
          where: { pokedex: { name: 'national' } },
          select: { pokedexNumber: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    //Process Generations
    const pokemonEntries = allSpecies.map((species) => ({
      pokedexId: nationalPokedex.id,
      pokemonSpecies: species,
    }));

    const generationMap = new Map<
      number,
      {
        generation: (typeof allSpecies)[number]['generation'];
        pokemonSpecies: typeof allSpecies;
      }
    >();

    for (const species of allSpecies) {
      const genId = species.generation.id;
      if (!generationMap.has(genId)) {
        generationMap.set(genId, {
          generation: species.generation,
          pokemonSpecies: [],
        });
      }
      generationMap.get(genId)!.pokemonSpecies.push(species);
    }

    const generations = Array.from(generationMap.values()).map(
      ({ generation, pokemonSpecies }) => ({
        ...generation,
        pokemonSpecies,
      }),
    );

    return {
      national: {
        ...nationalPokedex,
        pokemonSpecies: pokemonEntries.map((pokemonEntry) => pokemonEntry.pokemonSpecies),
      },
      generations,
    };
  }),

  regionalPokedexesByGeneration: publicProcedure
    .input(z.object({ generationId: z.number() }))
    .query(async ({ input }) => {
      /* 1. version groups in order ------------------------------------ */
      const versionGroups = await prisma.versionGroup.findMany({
        where: {
          generationId: input.generationId,
          pokedexes: {
            some: { pokedex: { isMainSeries: true } },
          },
        },
        select: {
          id: true,
          name: true,
          order: true,
          pokedexes: {
            where: { pokedex: { isMainSeries: true } },
            select: { pokedexId: true },
          },
        },
        orderBy: { order: 'asc' },
      });

      /* 2. all relevant pokedex ids (flat list) ----------------------- */
      const pokedexIds = versionGroups.flatMap((vg) => vg.pokedexes.map((p) => p.pokedexId));

      /* 3. ONE query for every species that appears in those dexes ---- */
      const allSpeciesRows = await prisma.pokemonSpecies.findMany({
        where: {
          pokedexNumbers: {
            some: { pokedexId: { in: pokedexIds } },
          },
        },
        select: {
          id: true,
          name: true,
          order: true,
          names: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: { name: true },
            take: 1,
          },
          pokedexNumbers: {
            where: { pokedexId: { in: pokedexIds } },
          },
          pokemon: {
            where: {
              NOT: { name: { contains: 'gmax' } }, // <-- exclude g-max forms
            },
            select: {
              id: true,
              name: true,
              sprites: true,
              forms: { select: { versionGroupId: true } },
              isDefault: true,
              types: basicTypeSelect,
            },
          },
        },
        orderBy: { id: 'asc' },
      });

      /* 4. Build the exact original JSON with correct per-dex order ----- */
      const dexMap = new Map<number, any[]>(); // pokedexId -> pokemonEntries

      for (const species of allSpeciesRows) {
        for (const pn of species.pokedexNumbers) {
          const pokedexId = pn.pokedexId;

          /* choose the one pokemon we would have returned */
          const pokemon =
            species.pokemon.find(
              (p) =>
                p.forms.some((f) => versionGroups.some((vg) => vg.id === f.versionGroupId)) ||
                (p.isDefault &&
                  !species.pokemon.some((pp) =>
                    pp.forms.some((f) => versionGroups.some((vg) => vg.id === f.versionGroupId)),
                  )),
            ) ?? species.pokemon.find((p) => p.isDefault);

          if (!pokemon) continue;

          dexMap.set(
            pokedexId,
            (dexMap.get(pokedexId) || []).concat({
              pokedexId,
              pokedexNumber: pn.pokedexNumber,
              pokemonSpecies: {
                ...species,
                pokemon: [pokemon],
                /* keep ONLY the pokedexNumbers that belong to this dex */
                pokedexNumbers: species.pokedexNumbers.filter((n) => n.pokedexId === pokedexId),
              },
            }),
          );
        }
      }

      /* --- sort every dex's list by its own pokedexNumber -------------- */
      dexMap.forEach((entries) => entries.sort((a, b) => a.pokedexNumber - b.pokedexNumber));

      /* 5. Re-create the outer structure ------------------------------ */
      const pokedexDetails = await prisma.pokedex.findMany({
        where: { id: { in: pokedexIds } },
        select: {
          id: true,
          name: true,
          region: true,
          names: {
            where: { languageId: DEFAULT_LANGUAGE_ID },
            select: { name: true },
            take: 1,
          },
        },
      });
      const pokedexMap = new Map(pokedexDetails.map((p) => [p.id, p]));

      const versionGroupsWithPokemon = versionGroups.map((vg) => ({
        id: vg.id,
        name: vg.name,
        order: vg.order,
        pokedexes: vg.pokedexes
          .map((p) => ({
            pokedex: {
              ...pokedexMap.get(p.pokedexId)!,
              pokemonSpecies:
                dexMap.get(p.pokedexId)?.map((pokemonEntry) => pokemonEntry.pokemonSpecies) || [],
              // pokemonEntries: dexMap.get(p.pokedexId) || [],
            },
          }))
          .sort((a, b) => a.pokedex.id - b.pokedex.id),
      }));

      return {
        id: input.generationId,
        versionGroups: versionGroupsWithPokemon,
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
});
