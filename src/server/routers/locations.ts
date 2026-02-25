import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '~/server/prisma';
import { locationListSelect, locationDetailSelect } from './selectors';

export const locationsRouter = router({
  // Returns [{ id: generationId, regionId }] for all generations that have a main region
  generations: publicProcedure.query(async () => {
    const gens = await prisma.generation.findMany({
      where: { mainRegionId: { not: null } },
      select: { id: true, mainRegionId: true },
      orderBy: { id: 'asc' },
    });
    return gens as { id: number; mainRegionId: number }[];
  }),

  list: publicProcedure
    .input(z.object({ generationId: z.number().int().optional() }).optional())
    .query(async ({ input }) => {
      let regionId: number | undefined;

      if (input?.generationId) {
        const gen = await prisma.generation.findUnique({
          where: { id: input.generationId },
          select: { mainRegionId: true },
        });
        regionId = gen?.mainRegionId ?? undefined;
      }

      return await prisma.location.findMany({
        where: regionId
          ? { regionId }
          : { regionId: { not: null } },
        ...locationListSelect,
        orderBy: { id: 'asc' },
      });
    }),

  byName: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const location = await prisma.location.findFirst({
        where: { name: input },
        ...locationDetailSelect,
      });
      if (!location) throw new TRPCError({ code: 'NOT_FOUND', message: `Location '${input}' not found` });
      return location;
    }),
});
