import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { moveSelect } from './selectors';

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
});
