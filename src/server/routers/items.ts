import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { itemListSelect, itemDetailSelect } from './selectors';

export const itemsRouter = router({
  generations: publicProcedure.query(async () => {
    const rows = await prisma.versionGroup.findMany({
      where: {
        itemFlavorTexts: {
          some: { item: { sprite: { not: null } } },
        },
      },
      select: { generationId: true },
      distinct: ['generationId'],
      orderBy: { generationId: 'asc' },
    });
    return rows.map((r) => r.generationId);
  }),

  list: publicProcedure
    .input(z.object({ generationId: z.number().int().optional() }).optional())
    .query(async ({ input }) => {
      return await prisma.item.findMany({
        where: {
          sprite: { not: null },
          NOT: {
            AND: [
              { itemCategory: { name: 'all-machines' } },
              { effectTexts: { none: {} } },
            ],
          },
          ...(input?.generationId
            ? {
                flavorTexts: {
                  some: { versionGroup: { generationId: { lte: input.generationId } } },
                },
              }
            : undefined),
        },
        ...itemListSelect,
        orderBy: { id: 'asc' },
      });
    }),

  byName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      const item = await prisma.item.findUnique({
        where: { name: input.name },
        ...itemDetailSelect,
      });

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Item "${input.name}" not found` });
      }

      return item;
    }),
});
