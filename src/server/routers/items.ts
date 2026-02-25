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

  holdable: publicProcedure
    .input(z.object({ generationId: z.number().int() }).optional())
    .query(async ({ input }) => {
      return await prisma.item.findMany({
        where: {
          itemCategory: {
            name: {
              in: [
                'held-items',
                'choice',
                'bad-held-items',
                'type-enhancement',
                'plates',
                'mega-stones',
                'memories',
                'scarves',
                'species-specific',
                'effort-training',
                'jewels',
                // Berries
                'medicine',        // Lum Berry, Sitrus Berry, Oran Berry, etc.
                'in-a-pinch',      // Salac Berry, Petaya Berry, Liechi Berry, etc.
                'picky-healing',   // Figy Berry, Wiki Berry, Aguav Berry, etc.
                'type-protection', // Chople Berry, Babiri Berry, Passho Berry, etc.
                // Gen 7
                'z-crystals',
              ],
            },
          },
          ...(input?.generationId
            ? {
                OR: [
                  // Items whose flavor text confirms they exist in this generation or earlier
                  { flavorTexts: { some: { versionGroup: { generationId: { lte: input.generationId } } } } },
                  // Items with no flavor texts are Gen 9+ entries with incomplete DB data;
                  // only include them when building a Gen 9 team
                  ...(input.generationId >= 9 ? [{ flavorTexts: { none: {} } }] : []),
                ],
              }
            : undefined),
        },
        select: {
          id: true,
          name: true,
          sprite: true,
          names: { where: { languageId: 9 }, select: { name: true } },
        },
        orderBy: { name: 'asc' },
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
