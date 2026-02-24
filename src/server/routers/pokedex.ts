import { router, publicProcedure } from '../trpc';
import { prisma } from '~/server/prisma';
import { basicTypeSelect, pokemonFilter } from './selectors';
import { getOrCreateMapArray } from '~/utils/';

const DEFAULT_LANGUAGE_ID = 9; // English

type PokemonForm = {
  id: number;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  versionGroupId: number | null;
  isDefault: boolean;
  formName: string | null;
  isMega: boolean;
  pokemonId: number;
  formOrder: number;
  isBattleOnly: boolean;
};

export type RegionalPokedex = {
  id: number;
  name: string;
  names: { name: string }[];
  descriptions: { description: string }[];
  pokemon: number[];
};

const isMega = (form: PokemonForm) =>
  form.formName === 'mega' ||
  form.name.includes('-mega') ||
  form.name.includes('-primal') ||
  form.isMega;

export const pokedexRouter = router({
  pokedexByGeneration: publicProcedure.query(async () => {
    // National Pokedex
    const nationalPokedex = await prisma.pokedex.findUnique({
      where: { name: 'national' },
      select: {
        id: true,
        name: true,
      },
    });
    if (!nationalPokedex) return null;

    // One bulk species query ordered by id ASC
    const allSpecies = await prisma.pokemonSpecies.findMany({
      where: {
        pokedexNumbers: {
          some: { pokedex: { name: 'national' } },
        },
      },
      select: {
        id: true,
        name: true,
        order: true,
        names: {
          where: { languageId: DEFAULT_LANGUAGE_ID },
          select: { name: true },
          take: 1,
        },
        generation: {
          select: { name: true, id: true },
        },
        pokemon: {
          where: pokemonFilter,
          select: {
            id: true,
            name: true,
            isDefault: true,
            types: basicTypeSelect,
            sprites: { select: { frontDefault: true, frontShiny: true } },
            abilities: {
              select: {
                slot: true,
                isHidden: true,
                ability: {
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
              orderBy: { slot: 'asc' as const },
            },
            stats: {
              select: {
                baseStat: true,
                stat: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              orderBy: { stat: { id: 'asc' as const } },
            },
          },
        },
        pokedexNumbers: {
          where: { pokedex: { name: 'national' } },
          select: { pokedexNumber: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    // Process Generations (keep existing logic)
    const pokemonEntries = allSpecies.map((species) => ({
      pokedexId: nationalPokedex.id,
      pokemonSpecies: species,
    }));

    const generationMap = new Map<
      number,
      {
        generation: (typeof allSpecies)[number]['generation'];
        pokemonSpecies: typeof allSpecies;
      }
    >();

    for (const species of allSpecies) {
      const genId = species.generation.id;
      if (!generationMap.has(genId)) {
        generationMap.set(genId, {
          generation: species.generation,
          pokemonSpecies: [],
        });
      }
      generationMap.get(genId)!.pokemonSpecies.push(species);
    }

    const generations = Array.from(generationMap.values()).map(
      ({ generation, pokemonSpecies }) => ({
        ...generation,
        pokemonSpecies,
      }),
    );

    // PokemonListData format with hybrid deduplication
    const pokemonListData = allSpecies.flatMap((species) => {
      const { pokemon } = species;

      // Explicit species list for deduplication (small list for performance)
      const explicitDeduplicationList = [
        'minior',
        'vivillon',
        'furfrou',
        'pumpkaboo',
        'gourgeist',
        'basculin',
        'keldeo',
        'aegislash',
        'rockruff',
        'mimikyu',
        'zarude',
        'basculegion',
        'oinkologne',
        'maushold',
        'squawkabilly',
        'dudunsparce',
        'tatsugiri',
        'toxtricity',
        'eiscue',
        'indeedee',
        'eternatus',
        'palafin',
        'ogerpon',

        // Add more as needed
      ];

      // Handle explicit cases
      if (explicitDeduplicationList.includes(species.name)) {
        const defaultPokemon = pokemon.find((p) => p.isDefault) || pokemon[0];

        return [
          {
            pokemonId: defaultPokemon.id,
            speciesId: species.id,
            name: species.name, // Use species name
            sprites: {
              frontDefault: defaultPokemon.sprites?.frontDefault,
              frontShiny: defaultPokemon.sprites?.frontShiny,
            },
            types: defaultPokemon.types.map((t) => t.type.name),
            abilities: defaultPokemon.abilities,
            stats: defaultPokemon.stats,
          },
        ];
      }

      // Keep all forms for species with meaningful differences
      return pokemon.map((pokemon) => ({
        pokemonId: pokemon.id,
        speciesId: species.id,
        name: pokemon.name, // Keep individual form names
        sprites: {
          frontDefault: pokemon.sprites?.frontDefault,
          frontShiny: pokemon.sprites?.frontShiny,
        },
        types: pokemon.types.map((t) => t.type.name),
        abilities: pokemon.abilities,
        stats: pokemon.stats,
      }));
    });

    return {
      national: {
        ...nationalPokedex,
        pokemonSpecies: pokemonEntries.map((pokemonEntry) => pokemonEntry.pokemonSpecies),
        pokemonListData, // Pre-transformed data for cache
      },
      generations,
    };
  }),

  generationPokemonIds: publicProcedure.query(async () => {
    const generations = await prisma.generation.findMany({
      select: {
        id: true,
        name: true,
        pokemonSpecies: {
          select: {
            id: true,
            pokemon: {
              where: pokemonFilter,
              select: {
                id: true,
              },
            },
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    // Transform the data to a d usable format
    return generations.map((generation) => ({
      id: generation.id,
      name: generation.name,
      pokemonIds: generation.pokemonSpecies.flatMap((species) =>
        species.pokemon.map((pokemon) => pokemon.id),
      ),
      speciesIds: generation.pokemonSpecies.map((species) => species.id),
    }));
  }),
  regionalPokedexes: publicProcedure.query(async () => {
    // Get version groups for the generation
    const versionGroups = await prisma.versionGroup.findMany({
      where: {
        generation: { mainRegionId: { not: null } },
        pokedexes: { some: {} }, // Where pokedexes are not empty [],
        NOT: { name: { contains: 'lets-go' } },
      },
      select: {
        id: true,
        name: true,
        order: true,
        generationId: true,
        generation: { select: { mainRegionId: true } },
        pokedexes: true,
      },
      orderBy: { order: 'asc' },
    });

    const versionGroupsByGeneration = new Map<number, typeof versionGroups>();

    versionGroups.forEach((versionGroup) => {
      const generationId = versionGroup.generationId;

      if (!versionGroupsByGeneration.has(generationId)) {
        versionGroupsByGeneration.set(generationId, []);
      }

      versionGroupsByGeneration.get(generationId)!.push(versionGroup);
    });

    const pokedexIds = Array.from(
      new Set(versionGroups.flatMap((vg) => vg.pokedexes.map((p) => p.pokedexId))),
    );

    // Query for all pokedexes
    const allPokedexes = await prisma.pokedex.findMany({
      where: {
        id: { in: pokedexIds },
        // Add any filters you want here, like:
        isMainSeries: true,
        NOT: { name: { contains: 'letsgo' } },
      },
      select: {
        id: true,
        name: true,
        names: {
          select: {
            name: true,
          },
          where: {
            languageId: DEFAULT_LANGUAGE_ID,
          },
        },
        descriptions: {
          select: {
            description: true,
          },
          where: {
            languageId: DEFAULT_LANGUAGE_ID,
          },
        },
        pokemonEntries: {
          select: {
            pokedexId: true,
            pokemonSpeciesId: true,
            pokedexNumber: true,
            pokemonSpecies: {
              select: {
                pokemon: {
                  select: {
                    id: true,
                    name: true,
                    isDefault: true,
                    forms: true,
                  },
                },
              },
            },
          },
          orderBy: {
            pokedexNumber: 'asc',
          },
        },
      },
    });

    const filteredPokedexes = allPokedexes.map((pokedex) => ({
      ...pokedex,
      pokemonEntries: pokedex.pokemonEntries.filter((entry) => entry.pokedexId === pokedex.id),
    }));

    const pokedexMap = new Map(filteredPokedexes.map((p) => [p.id, p]));

    const finalPokedexesByGeneration = new Map<number, RegionalPokedex[]>();

    versionGroups.forEach((versionGroup) => {
      const generationId = versionGroup.generationId;

      const generationPokedexes = getOrCreateMapArray(finalPokedexesByGeneration, generationId);

      versionGroup.pokedexes.forEach((p) => {
        const pokedex = pokedexMap.get(p.pokedexId);
        if (!pokedex) return;

        // Skip duplicate pokedex in same generation
        const existingPokedex = generationPokedexes.find((existing) => existing.id === pokedex.id);
        if (existingPokedex) return;

        // Transform pokemonEntries to pokemon with correct pokemonId (including mega forms)
        const pokemon = pokedex.pokemonEntries.flatMap((entry) => {
          // Extract convenience references for readability
          const species = entry.pokemonSpecies;
          const pokemons = species.pokemon;

          // Determine if this generation supports Mega Evolutions
          const generationSupportsMegas = [6, 7].includes(versionGroup.generationId);

          // Check if any Pokémon under this species has a mega form
          const speciesHasMegaForms = pokemons.some((pokemon) =>
            pokemon.forms.some((form) => isMega(form)),
          );

          // Check if there's a default Pokémon in the species
          const hasDefaultPokemon = pokemons.some((p) => p.isDefault);

          const pokemonIds: number[] = [];

          // Generation supports megas and species has mega forms and a default
          if (generationSupportsMegas && speciesHasMegaForms && hasDefaultPokemon) {
            // Include the default Pokémon
            const defaultPokemon = pokemons.find((p) => p.isDefault);
            if (defaultPokemon) pokemonIds.push(defaultPokemon.id);

            // Include all mega evolution forms
            const megaPokemons = pokemons.filter((p) => p.forms.some((form) => isMega(form)));
            pokemonIds.push(...megaPokemons.map((p) => p.id));

            // Species has mega forms, but generation doesn’t support them — use only default
          } else if (speciesHasMegaForms && hasDefaultPokemon) {
            const defaultPokemon = pokemons.find((p) => p.isDefault);
            if (defaultPokemon) pokemonIds.push(defaultPokemon.id);

            // No megas — select the most appropriate form
          } else {
            // Try to find a Pokémon with a form specific to this version group
            const matchingFormPokemon = pokemons.find((p) =>
              p.forms.some((f) => f.versionGroupId === versionGroup.id),
            );

            // Fallback to default or first available Pokémon
            const fallbackPokemon = pokemons.find((p) => p.isDefault) ?? pokemons[0];

            if (matchingFormPokemon || fallbackPokemon) {
              pokemonIds.push((matchingFormPokemon ?? fallbackPokemon).id);
            }
          }

          return pokemonIds;
        });

        // Add the transformed pokedex
        generationPokedexes.push({
          id: pokedex.id,
          name: pokedex.name,
          names: pokedex.names,
          descriptions: pokedex.descriptions,
          pokemon: pokemon,
        });
      });
    });

    return finalPokedexesByGeneration;
  }),
});
