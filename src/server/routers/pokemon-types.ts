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
  pokemonForTypeSelect,
} from './selectors';

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
  getTypeWithPokemonAndMoves: publicProcedure
    .input(z.object({ typeName: z.string() }))
    .query(async ({ input }) => {
      const { typeName } = input;

      // Gets everything for the input Type through model relations
      const typeWithData = await prisma.type.findUnique({
        where: { name: typeName },
        select: {
          // Type information
          id: true,
          name: true,
          generationId: true,

          // Pokemon through pokemonTypes relation with variant filtering
          pokemonTypes: {
            where: {
              pokemon: {
                OR: [
                  { isDefault: true },
                  { name: { contains: '-alola' } },
                  { name: { contains: '-galar' } },
                  { name: { contains: '-hisui' } },
                  { name: { contains: '-paldea' } },
                  { name: { contains: '-mega' } },
                  { name: { contains: '-power-construct' } },
                  { name: { contains: '-complete' } },
                  { name: { contains: '-10' } },
                ],
              },
            },
            select: {
              pokemon: pokemonForTypeSelect,
            },
            orderBy: [
              { pokemon: { pokemonSpeciesId: 'asc' } }, // Group by species first
              { pokemon: { id: 'asc' } }, // Then by ID for consistency
            ],
          },
          // Moves through direct moves relation
          moves: {
            ...moveSelect,
            orderBy: { id: 'asc' },
          },
        },
      });

      if (!typeWithData) {
        throw new Error(`Type '${typeName}' not found`);
      }

      const processedPokemon = typeWithData.pokemonTypes.map((pokemonType) => {
        const seenAbilityIds = new Set();
        const filteredAbilities = [];

        // First pass: add all non-hidden abilities
        for (const ability of pokemonType.pokemon.abilities) {
          if (!ability.isHidden) {
            seenAbilityIds.add(ability.ability.id);
            filteredAbilities.push(ability);
          }
        }

        // Second pass: add hidden abilities only if not already seen
        for (const ability of pokemonType.pokemon.abilities) {
          if (ability.isHidden && !seenAbilityIds.has(ability.ability.id)) {
            filteredAbilities.push(ability);
          }
        }

        return {
          ...pokemonType.pokemon,
          abilities: filteredAbilities,
        };
      });

      // Return flat structure
      return {
        type: {
          id: typeWithData.id,
          name: typeWithData.name,
          generationId: typeWithData.generationId,
        },
        pokemon: processedPokemon,
        moves: typeWithData.moves,
      };
    }),
});
