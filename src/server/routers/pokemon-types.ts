import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import {
  basicTypeSelect,
  typeEffectivenessSelect,
  allTypeEfficaciesSelect,
  typeIdNameSelect,
  basicAbilitySelect,
  moveSelect,
  basicStatSelect,
} from './query-selectors';

export const pokemonTypesRouter = router({
  allTypes: publicProcedure.query(async () => {
    return await prisma.type.findMany({
      where: {
        name: {
          notIn: ['shadow', 'unknown', 'stellar'],
        },
      },
      ...typeIdNameSelect,
      orderBy: {
        id: 'asc',
      },
    });
  }),
  getTypeEffectiveness: publicProcedure
    .input(z.object({ typeId: z.number() }))
    .query(async ({ input }) => {
      const { typeId } = input;
      const effectiveness = await prisma.typeEfficacy.findMany({
        where: {
          damageTypeId: typeId,
        },
        select: typeEffectivenessSelect,
      });
      return effectiveness;
    }),
  getAllTypeEfficacies: publicProcedure.query(async () => {
    const effectiveness = await prisma.typeEfficacy.findMany({
      select: allTypeEfficaciesSelect,
    });
    return effectiveness;
  }),
  getPokemonByType: publicProcedure
    .input(z.object({ typeId: z.number() }))
    .query(async ({ input }) => {
      const { typeId } = input;
      const pokemon = await prisma.pokemon.findMany({
        where: {
          types: {
            some: {
              typeId: typeId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          sprites: {
            select: {
              frontDefault: true,
            },
          },
          pokemonSpecies: {
            select: {
              pokedexNumbers: {
                select: {
                  pokedexNumber: true,
                },
              },
            },
          },
          types: basicTypeSelect,
          stats: basicStatSelect,
          abilities: basicAbilitySelect,
        },
        orderBy: {
          id: 'asc',
        },
      });
      return pokemon;
    }),
  getMovesByType: publicProcedure
    .input(z.object({ typeId: z.number() }))
    .query(async ({ input }) => {
      const { typeId } = input;
      const moves = await prisma.move.findMany({
        where: {
          typeId: typeId,
        },
        ...moveSelect,
        orderBy: {
          id: 'asc',
        },
      });
      return moves;
    }),
});
