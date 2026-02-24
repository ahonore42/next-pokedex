import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { abilityListSelect, pokemonForTypeSelect, pokemonFilter } from './selectors';

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

  byName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      const ability = await prisma.ability.findUnique({
        where: { name: input.name },
        ...abilityListSelect,
      });

      if (!ability) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Ability "${input.name}" not found` });
      }

      const pokemonAbilities = await prisma.pokemonAbility.findMany({
        where: { abilityId: ability.id, pokemon: pokemonFilter },
        select: { slot: true, isHidden: true, pokemon: pokemonForTypeSelect },
        orderBy: { pokemon: { id: 'asc' } },
      });

      return { ability, pokemon: pokemonAbilities };
    }),
});
