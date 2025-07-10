import { router, publicProcedure } from '../trpc';
import { prisma } from '~/server/prisma';

const DEFAULT_LANGUAGE_ID = 9; // English

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
        pokemonSpecies: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            order: true,
            names: {
              where: { languageId: DEFAULT_LANGUAGE_ID },
              select: { name: true },
            },
            varieties: {
              select: {
                isDefault: true,
                pokemon: {
                  select: {
                    id: true,
                    name: true,
                    sprites: {
                      select: {
                        frontDefault: true,
                      },
                    },
                    types: {
                      orderBy: { slot: 'asc' },
                      select: {
                        slot: true,
                        type: {
                          select: {
                            id: true,
                            name: true,
                            names: {
                              where: { languageId: DEFAULT_LANGUAGE_ID },
                              select: { name: true },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              where: { isDefault: true },
            },
            evolvesFromSpecies: {
              select: {
                id: true,
                name: true,
              },
            },
            evolvesToSpecies: {
              select: {
                id: true,
                name: true,
                names: {
                  where: { languageId: DEFAULT_LANGUAGE_ID },
                  select: { name: true },
                },
                pokemonEvolutions: {
                  select: {
                    evolutionTrigger: {
                      select: {
                        name: true,
                      },
                    },
                    minLevel: true,
                    evolutionItem: {
                      select: {
                        name: true,
                      },
                    },
                    heldItem: {
                      select: {
                        name: true,
                      },
                    },
                    knownMove: {
                      select: {
                        name: true,
                      },
                    },
                    knownMoveType: {
                      select: {
                        name: true,
                      },
                    },
                    location: {
                      select: {
                        name: true,
                      },
                    },
                    minHappiness: true,
                    minBeauty: true,
                    minAffection: true,
                    needsOverworldRain: true,
                    partySpeciesId: true,
                    partyTypeId: true,
                    partyType: {
                      select: {
                        name: true,
                        names: {
                          where: { languageId: DEFAULT_LANGUAGE_ID },
                          select: { name: true },
                        },
                      },
                    },
                    relativePhysicalStats: true,
                    tradeSpeciesId: true,
                    turnUpsideDown: true,
                    timeOfDay: true,
                  },
                },
              },
            },
            pokemonEvolutions: {
              select: {
                evolutionTrigger: {
                  select: {
                    name: true,
                  },
                },
                minLevel: true,
                evolutionItem: {
                  select: {
                    name: true,
                  },
                },
                heldItem: {
                  select: {
                    name: true,
                  },
                },
                knownMove: {
                  select: {
                    name: true,
                  },
                },
                knownMoveType: {
                  select: {
                    name: true,
                  },
                },
                location: {
                  select: {
                    name: true,
                  },
                },
                minHappiness: true,
                minBeauty: true,
                minAffection: true,
                needsOverworldRain: true,
                partySpeciesId: true,
                partyTypeId: true,
                partyType: {
                  select: {
                    name: true,
                    names: {
                      where: { languageId: DEFAULT_LANGUAGE_ID },
                      select: { name: true },
                    },
                  },
                },
                relativePhysicalStats: true,
                tradeSpeciesId: true,
                turnUpsideDown: true,
                timeOfDay: true,
              },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    const allPokemonSpecies = await prisma.pokemonSpecies.findMany({
      select: {
        id: true,
        name: true,
        order: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
        },
        varieties: {
          select: {
            isDefault: true,
            pokemon: {
              select: {
                id: true,
                name: true,
                sprites: {
                  select: {
                    frontDefault: true,
                  },
                },
                types: {
                  orderBy: { slot: 'asc' },
                  select: {
                    slot: true,
                    type: {
                      select: {
                        id: true,
                        name: true,
                        names: {
                          where: { languageId: DEFAULT_LANGUAGE_ID },
                          select: { name: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          where: { isDefault: true },
        },
        evolvesFromSpecies: {
          select: {
            id: true,
            name: true,
          },
        },
        evolvesToSpecies: {
          select: {
            id: true,
            name: true,
            names: {
              where: { languageId: DEFAULT_LANGUAGE_ID },
              select: { name: true },
            },
            pokemonEvolutions: {
              select: {
                evolutionTrigger: {
                  select: {
                    name: true,
                  },
                },
                minLevel: true,
                evolutionItem: {
                  select: {
                    name: true,
                  },
                },
                heldItem: {
                  select: {
                    name: true,
                  },
                },
                knownMove: {
                  select: {
                    name: true,
                  },
                },
                knownMoveType: {
                  select: {
                    name: true,
                  },
                },
                location: {
                  select: {
                    name: true,
                  },
                },
                minHappiness: true,
                minBeauty: true,
                minAffection: true,
                needsOverworldRain: true,
                partySpeciesId: true,
                partyTypeId: true,
                partyType: {
                  select: {
                    name: true,
                    names: {
                      where: { languageId: DEFAULT_LANGUAGE_ID },
                      select: { name: true },
                    },
                  },
                },
                relativePhysicalStats: true,
                tradeSpeciesId: true,
                turnUpsideDown: true,
                timeOfDay: true,
              },
            },
          },
        },
        pokemonEvolutions: {
          select: {
            evolutionTrigger: {
              select: {
                name: true,
              },
            },
            minLevel: true,
            evolutionItem: {
              select: {
                name: true,
              },
            },
            heldItem: {
              select: {
                name: true,
              },
            },
            knownMove: {
              select: {
                name: true,
              },
            },
            knownMoveType: {
              select: {
                name: true,
              },
            },
            location: {
              select: {
                name: true,
              },
            },
            minHappiness: true,
            minBeauty: true,
            minAffection: true,
            needsOverworldRain: true,
            partySpeciesId: true,
            partyTypeId: true,
            partyType: {
              select: {
                name: true,
                names: {
                  where: { languageId: DEFAULT_LANGUAGE_ID },
                  select: { name: true },
                },
              },
            },
            relativePhysicalStats: true,
            tradeSpeciesId: true,
            turnUpsideDown: true,
            timeOfDay: true,
          },
        },
      },
    });

    const speciesMap = new Map(allPokemonSpecies.map((s) => [s.id, s]));

    return chains.map((chain) => {
      const requiredSpeciesIds = new Set<number>();
      chain.pokemonSpecies.forEach((species) => {
        species.evolvesToSpecies.forEach((evolvesTo) => {
          evolvesTo.pokemonEvolutions.forEach((evo) => {
            if (evo.partySpeciesId) requiredSpeciesIds.add(evo.partySpeciesId);
            if (evo.tradeSpeciesId) requiredSpeciesIds.add(evo.tradeSpeciesId);
          });
        });
      });

      const additionalSpecies = Array.from(requiredSpeciesIds)
        .map((id) => speciesMap.get(id))
        .filter((s): s is NonNullable<typeof s> => !!s);

      const finalSpecies = [...chain.pokemonSpecies, ...additionalSpecies];
      const uniqueSpecies = Array.from(new Map(finalSpecies.map((s) => [s.id, s])).values());

      return {
        ...chain,
        pokemonSpecies: uniqueSpecies,
      };
    });
  }),
});
