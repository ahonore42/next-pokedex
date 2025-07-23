import { router, publicProcedure } from '../trpc';
import { prisma } from '~/server/prisma';
import { z } from 'zod';
import {
  evolutionBabyTriggerItemSelect,
  evolutionSpeciesSelect,
  pokemonEvolutionsSelect,
} from './selectors';

/**
 * Helper function to fix pokemonEvolutions data for a single evolution chain
 * Ensures every species has complete pokemonEvolutions data showing how THAT species evolves
 */
async function enhanceEvolutionChainPokemonEvolutions(chain: any) {
  const allSpecies = chain.pokemonSpecies;
  const allSpeciesIds = allSpecies.map((s: any) => s.id);

  // Fetch evolution data where pokemonSpeciesId is the TARGET species
  const evolutionRecords = await prisma.pokemonEvolution.findMany({
    where: {
      pokemonSpeciesId: { in: allSpeciesIds },
    },
    ...pokemonEvolutionsSelect,
  });

  // Map evolution conditions to SOURCE species
  const evolutionsBySourceSpecies = new Map<number, any[]>();

  evolutionRecords.forEach((evolution) => {
    const { pokemonSpeciesId: targetSpeciesId, ...evolutionConditions } = evolution;

    // Find which species evolves TO this target
    const sourceSpecies = allSpecies.find((s: any) =>
      s.evolvesToSpecies?.some((evolvesTo: any) => evolvesTo.id === targetSpeciesId),
    );

    if (sourceSpecies) {
      if (!evolutionsBySourceSpecies.has(sourceSpecies.id)) {
        evolutionsBySourceSpecies.set(sourceSpecies.id, []);
      }
      evolutionsBySourceSpecies.get(sourceSpecies.id)!.push(evolutionConditions);
    }
  });

  // Enhance each species with correct pokemonEvolutions
  const enhancedSpecies = allSpecies.map((speciesItem: any) => ({
    ...speciesItem,
    pokemonEvolutions: evolutionsBySourceSpecies.get(speciesItem.id) || [],
  }));

  return {
    ...chain,
    pokemonSpecies: enhancedSpecies,
  };
}

export const evolutionChainsRouter = router({
  all: publicProcedure.query(async () => {
    const chains = await prisma.evolutionChain.findMany({
      where: {
        pokemonSpecies: {
          some: {
            OR: [{ evolvesFromSpecies: { isNot: null } }, { evolvesToSpecies: { some: {} } }],
          },
        },
      },
      select: {
        id: true,
        babyTriggerItem: evolutionBabyTriggerItemSelect,
        pokemonSpecies: {
          orderBy: { order: 'asc' },
          select: evolutionSpeciesSelect,
        },
      },
      orderBy: { id: 'asc' },
    });

    const allPokemonSpecies = await prisma.pokemonSpecies.findMany({
      select: evolutionSpeciesSelect,
    });

    const speciesMap = new Map(allPokemonSpecies.map((s) => [s.id, s]));

    const processedChains = await Promise.all(
      chains.map(async (chain) => {
        const requiredSpeciesIds = new Set<number>();

        chain.pokemonSpecies.forEach((species) => {
          species.evolvesToSpecies.forEach((evolvesTo) => {
            evolvesTo.pokemonEvolutions.forEach((evo) => {
              if (evo.partySpeciesId) requiredSpeciesIds.add(evo.partySpeciesId);
              if (evo.tradeSpeciesId) requiredSpeciesIds.add(evo.tradeSpeciesId);
            });
          });
        });

        // Edge case handler for cross-chain evolutions
        const speciesIdsInChain = chain.pokemonSpecies.map((s) => s.id);
        let crossChainEvolutions: any[] = [];

        // Check if any evolvesToSpecies are missing from the current chain
        const missingEvolutionTargets = new Set<number>();
        chain.pokemonSpecies.forEach((species) => {
          species.evolvesToSpecies.forEach((evolvesTo) => {
            const targetExists = chain.pokemonSpecies.find((s) => s.id === evolvesTo.id);
            if (!targetExists) {
              missingEvolutionTargets.add(evolvesTo.id);
            }
          });
        });

        // Only look for cross-chain evolutions if we have missing targets
        if (missingEvolutionTargets.size > 0) {
          crossChainEvolutions = await prisma.pokemonSpecies.findMany({
            where: {
              evolvesFromSpeciesId: { in: speciesIdsInChain },
              evolutionChainId: { not: chain.id },
              id: { in: Array.from(missingEvolutionTargets) }, // Only missing targets
            },
            select: {
              ...evolutionSpeciesSelect,
              evolvesFromSpeciesId: true, // Add the foreign key field
              evolutionChainId: true, // Add the chain ID field
            },
          });

          crossChainEvolutions.forEach((species) => {
            const evolvesFromSpecies = chain.pokemonSpecies.find(
              (s) => s.id === species.evolvesFromSpeciesId,
            );
            console.log(
              `Edge case found: ${species.name} (chain ${species.evolutionChainId}) evolves from ${evolvesFromSpecies?.name} (chain ${chain.id})`,
            );
            requiredSpeciesIds.add(species.id);
          });
        }

        const additionalSpecies = Array.from(requiredSpeciesIds)
          .map((id) => speciesMap.get(id))
          .filter((s): s is NonNullable<typeof s> => !!s)
          .concat(crossChainEvolutions);

        const finalSpecies = [...chain.pokemonSpecies, ...additionalSpecies];
        const uniqueSpecies = Array.from(new Map(finalSpecies.map((s) => [s.id, s])).values());

        const chainWithSpecies = {
          ...chain,
          pokemonSpecies: uniqueSpecies,
        };

        // Enhance pokemonEvolutions data
        const enhancedChain = await enhanceEvolutionChainPokemonEvolutions(chainWithSpecies);

        return {
          ...enhancedChain,
          absorbedSpeciesIds: crossChainEvolutions.map((s) => s.id), // Track absorbed species
        };
      }),
    );

    // Filter out chains that have been absorbed into other chains
    const validChains = processedChains.filter((chain) => {
      // Check if ALL species in this chain exist in other chains
      const allSpeciesIds = chain.pokemonSpecies.map((s: any) => s.id);
      const speciesExistInOtherChains = allSpeciesIds.every((speciesId: number) => {
        return processedChains.some(
          (otherChain) =>
            otherChain.id !== chain.id &&
            otherChain.pokemonSpecies.some((s: any) => s.id === speciesId),
        );
      });

      // If all species exist in other chains, this chain is redundant
      if (speciesExistInOtherChains) {
        console.log(
          `Filtering out redundant chain ${chain.id} - all species absorbed into other chains`,
        );
        return false;
      }

      return true;
    });

    // Remove the absorbedSpeciesIds from the final result
    return validChains.map(({ absorbedSpeciesIds: _, ...chain }) => chain);
  }),
  bySpeciesId: publicProcedure
    .input(
      z.object({
        speciesId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const { speciesId } = input;

      // First, find the evolution chain ID for this species
      const speciesWithChain = await prisma.pokemonSpecies.findUnique({
        where: { id: speciesId },
        select: { evolutionChainId: true },
      });

      if (!speciesWithChain?.evolutionChainId) {
        return null;
      }

      // Get the complete evolution chain with all species in one query
      const chain = await prisma.evolutionChain.findUnique({
        where: { id: speciesWithChain.evolutionChainId },
        select: {
          id: true,
          pokemonSpecies: {
            orderBy: { order: 'asc' },
            select: evolutionSpeciesSelect,
          },
        },
      });

      if (!chain) {
        return null;
      }

      // Collect required additional species IDs from evolution conditions
      const requiredSpeciesIds = new Set<number>();
      chain.pokemonSpecies.forEach((species) => {
        species.evolvesToSpecies.forEach((evolvesTo) => {
          evolvesTo.pokemonEvolutions.forEach((evo) => {
            if (evo.partySpeciesId) requiredSpeciesIds.add(evo.partySpeciesId);
            if (evo.tradeSpeciesId) requiredSpeciesIds.add(evo.tradeSpeciesId);
          });
        });
      });

      // Only fetch additional species if there are any required
      let additionalSpecies: any[] = [];
      if (requiredSpeciesIds.size > 0) {
        additionalSpecies = await prisma.pokemonSpecies.findMany({
          where: {
            id: { in: Array.from(requiredSpeciesIds) },
          },
          select: evolutionSpeciesSelect,
        });
      }

      // Combine chain species with additional species, removing duplicates
      const finalSpecies = [...chain.pokemonSpecies, ...additionalSpecies];
      const uniqueSpecies = Array.from(new Map(finalSpecies.map((s) => [s.id, s])).values());

      const chainWithSpecies = {
        ...chain,
        pokemonSpecies: uniqueSpecies,
      };

      // Enhance pokemonEvolutions data
      return await enhanceEvolutionChainPokemonEvolutions(chainWithSpecies);
    }),
  paginated: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).nullish(),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 20;
      const { cursor } = input;

      const chains = await prisma.evolutionChain.findMany({
        where: {
          pokemonSpecies: {
            some: {
              OR: [{ evolvesFromSpecies: { isNot: null } }, { evolvesToSpecies: { some: {} } }],
            },
          },
        },
        select: {
          id: true,
          babyTriggerItem: evolutionBabyTriggerItemSelect,
          pokemonSpecies: {
            orderBy: { order: 'asc' },
            select: evolutionSpeciesSelect,
          },
        },
        orderBy: { id: 'asc' },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (chains.length > limit) {
        const nextItem = chains.pop()!;
        nextCursor = nextItem.id;
      }

      const allPokemonSpecies = await prisma.pokemonSpecies.findMany({
        select: evolutionSpeciesSelect,
      });

      const speciesMap = new Map(allPokemonSpecies.map((s) => [s.id, s]));

      const processedChains = await Promise.all(
        chains.map(async (chain) => {
          const requiredSpeciesIds = new Set<number>();

          // Existing logic for party/trade species
          chain.pokemonSpecies.forEach((species) => {
            species.evolvesToSpecies.forEach((evolvesTo) => {
              evolvesTo.pokemonEvolutions.forEach((evo) => {
                if (evo.partySpeciesId) requiredSpeciesIds.add(evo.partySpeciesId);
                if (evo.tradeSpeciesId) requiredSpeciesIds.add(evo.tradeSpeciesId);
              });
            });
          });

          // Edge case handler for cross-chain evolutions
          const speciesIdsInChain = chain.pokemonSpecies.map((s) => s.id);
          let crossChainEvolutions: any[] = [];

          // Check if any evolvesToSpecies are missing from the current chain
          const missingEvolutionTargets = new Set<number>();
          chain.pokemonSpecies.forEach((species) => {
            species.evolvesToSpecies.forEach((evolvesTo) => {
              const targetExists = chain.pokemonSpecies.find((s) => s.id === evolvesTo.id);
              if (!targetExists) {
                missingEvolutionTargets.add(evolvesTo.id);
              }
            });
          });

          // Only look for cross-chain evolutions if we have missing targets
          if (missingEvolutionTargets.size > 0) {
            // Find Pokemon that evolve FROM species in this chain but are in different chains
            crossChainEvolutions = await prisma.pokemonSpecies.findMany({
              where: {
                evolvesFromSpeciesId: { in: speciesIdsInChain },
                evolutionChainId: { not: chain.id }, // Different chain
                id: { in: Array.from(missingEvolutionTargets) }, // Only missing targets
              },
              select: {
                ...evolutionSpeciesSelect,
                evolvesFromSpeciesId: true, // Add the foreign key field
                evolutionChainId: true, // Add the chain ID field
              },
            });

            // Log when we find these edge cases
            crossChainEvolutions.forEach((species) => {
              const evolvesFromSpecies = chain.pokemonSpecies.find(
                (s) => s.id === species.evolvesFromSpeciesId,
              );
              console.log(
                `Edge case found: ${species.name} (chain ${species.evolutionChainId}) evolves from ${evolvesFromSpecies?.name} (chain ${chain.id})`,
              );
              requiredSpeciesIds.add(species.id);
            });
          }

          // Combine all additional species
          const additionalSpecies = Array.from(requiredSpeciesIds)
            .map((id) => speciesMap.get(id))
            .filter((s): s is NonNullable<typeof s> => !!s)
            .concat(crossChainEvolutions); // Include the cross-chain evolutions

          const finalSpecies = [...chain.pokemonSpecies, ...additionalSpecies];
          const uniqueSpecies = Array.from(new Map(finalSpecies.map((s) => [s.id, s])).values());

          const chainWithSpecies = {
            ...chain,
            pokemonSpecies: uniqueSpecies,
          };

          // Enhance pokemonEvolutions data
          const enhancedChain = await enhanceEvolutionChainPokemonEvolutions(chainWithSpecies);

          return {
            ...enhancedChain,
            absorbedSpeciesIds: crossChainEvolutions.map((s) => s.id), // Track absorbed species
          };
        }),
      );

      // Filter out chains that have been absorbed into other chains
      const validChains = processedChains.filter((chain) => {
        // Check if ALL species in this chain exist in other chains
        const allSpeciesIds = chain.pokemonSpecies.map((s: any) => s.id);
        const speciesExistInOtherChains = allSpeciesIds.every((speciesId: number) => {
          return processedChains.some(
            (otherChain) =>
              otherChain.id !== chain.id &&
              otherChain.pokemonSpecies.some((s: any) => s.id === speciesId),
          );
        });

        // If all species exist in other chains, this chain is redundant
        if (speciesExistInOtherChains) {
          console.log(
            `Filtering out redundant chain ${chain.id} - all species absorbed into other chains`,
          );
          return false;
        }

        return true;
      });

      // Remove the absorbedSpeciesIds from the final result
      const finalChains = validChains.map(({ absorbedSpeciesIds: _, ...chain }) => chain);

      return {
        chains: finalChains,
        nextCursor,
      };
    }),
});
