import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { abilityListSelect } from './selectors';

export const abilitiesRouter = router({
  generations: publicProcedure.query(async () => {
    const rows = await prisma.ability.findMany({
      select: { generationId: true },
      distinct: ['generationId'],
      orderBy: { generationId: 'asc' },
    });
    return rows.map((r) => r.generationId);
  }),

  list: publicProcedure
    .input(
      z
        .object({
          generationId: z.number().int().min(1).max(9).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      return await prisma.ability.findMany({
        where: input?.generationId ? { generationId: { lte: input.generationId } } : undefined,
        ...abilityListSelect,
        orderBy: { id: 'asc' },
      });
    }),
});
