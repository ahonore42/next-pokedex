import { router, publicProcedure } from '../trpc';
import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';

/**
 * Default selector for Post.
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
          languageId: 9, // Filter for language ID 9
        },
        select: {
          flavorText: true,
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

export const pokemonRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ input }) => {
      /**
       * For pagination docs you can have a look here
       * @see https://trpc.io/docs/v11/useInfiniteQuery
       * @see https://www.prisma.io/docs/concepts/components/prisma-client/pagination
       */

      const limit = input.limit ?? 50;
      const { cursor } = input;

      const pokemonList = await prisma.pokemon.findMany({
        select: defaultPokemonSelect,
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        where: {},
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        orderBy: {
          createdAt: 'desc',
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (pokemonList.length > limit) {
        // Remove the last item and use it as next cursor

        const nextItem = pokemonList.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        pokemon: pokemonList.reverse(),
        nextCursor,
      };
    }),
  byId: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;
      const pokemon = await prisma.pokemon.findUnique({
        where: { id },
        select: defaultPokemonSelect,
      });
      if (!pokemon) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No pokemon with id '${id}'`,
        });
      }
      return pokemon;
    }),
  byName: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { name } = input;
      const pokemon = await prisma.pokemon.findUnique({
        where: { name },
        select: defaultPokemonSelect,
      });
      if (!pokemon) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No pokemon with name '${name}'`,
        });
      }
      return pokemon;
    }),
  featured: publicProcedure.query(async () => {
    const pokemonPoolIds = [
      25, 6, 9, 3, 150, 151, 144, 145, 146, 243, 244, 245, 249, 250, 155, 158, 161, 384, 383, 382,
      254, 257, 260, 448, 445, 483, 484, 487, 490, 491, 492, 493, 643, 644, 646, 494, 495, 498, 501,
      716, 717, 718, 658, 654, 650, 789, 791, 792, 800, 785, 786, 787, 788, 888, 889, 890, 898, 894,
      895, 896, 1007, 1008, 1009, 1010, 999, 1000, 1001, 94, 130, 149, 196, 197, 134, 135, 136, 448,
      700, 282, 376, 373, 334, 445,
    ];

    const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Days since epoch
    const dailySelectionIds = Array.from(
      { length: 6 },
      (_, i) => pokemonPoolIds[(seed + i) % pokemonPoolIds.length],
    );

    const pokemon = await prisma.pokemon.findMany({
      where: { id: { in: dailySelectionIds } },
      select: defaultPokemonSelect,
    });

    return { pokemon, date: new Date().toISOString().split('T')[0] };
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
        limit: z.number().min(1).max(50).default(10), // Configurable limit
      }),
    )
    .query(async ({ input }) => {
      const { query, limit } = input;
      const searchTerm = query.trim().toLowerCase();

      if (!searchTerm) {
        return { pokemon: [] };
      }

      // Try exact match first (fastest)
      const exactMatch = await prisma.pokemon.findFirst({
        where: {
          name: {
            equals: searchTerm,
            mode: 'insensitive',
          },
        },
        select: pokemonSearchSelect,
      });

      // If exact match found, prioritize it
      if (exactMatch) {
        const remainingResults = await prisma.pokemon.findMany({
          where: {
            AND: [
              {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              {
                id: { not: exactMatch.id }, // Exclude exact match
              },
            ],
          },
          select: pokemonSearchSelect,
          take: limit - 1, // Reserve one spot for exact match
          orderBy: { name: 'asc' },
        });

        return {
          pokemon: [exactMatch, ...remainingResults],
          query: searchTerm,
          limit,
        };
      }

      // No exact match - do broader search
      const results = await prisma.pokemon.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        select: pokemonSearchSelect,
        take: limit,
        orderBy: { name: 'asc' },
      });

      return {
        pokemon: results,
        query: searchTerm,
        limit,
      };
    }),
});
