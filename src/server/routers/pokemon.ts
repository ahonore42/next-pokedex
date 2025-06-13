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
});
