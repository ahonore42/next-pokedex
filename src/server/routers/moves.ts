import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { moveSelect, pokemonForTypeSelect, pokemonFilter } from './selectors';

export const movesRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          typeName: z.string().optional(),
          generationId: z.number().int().min(1).max(9).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const where: Record<string, unknown> = {};
      if (input?.typeName) where.type = { name: input.typeName };
      if (input?.generationId) where.generationId = { lte: input.generationId };

      return await prisma.move.findMany({
        where: Object.keys(where).length ? where : undefined,
        ...moveSelect,
        orderBy: { id: 'asc' },
      });
    }),

  byName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      const move = await prisma.move.findUnique({
        where: { name: input.name },
        ...moveSelect,
      });

      if (!move) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Move "${input.name}" not found` });
      }

      const learners = await prisma.pokemonMove.findMany({
        where: { moveId: move.id, pokemon: pokemonFilter },
        distinct: ['pokemonId'],
        select: { pokemon: pokemonForTypeSelect },
        orderBy: { pokemon: { id: 'asc' } },
      });

      return { move, pokemon: learners.map((l) => l.pokemon) };
    }),
});
