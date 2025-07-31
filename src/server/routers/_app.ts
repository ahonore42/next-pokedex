/**
 * This file contains the root router of the tRPC-backend
 */
import { inferRouterOutputs } from '@trpc/server';
import { createCallerFactory, publicProcedure, router } from '../trpc';
import { pokemonRouter } from './pokemon';
import { pokemonTypesRouter } from './pokemon-types';
import { evolutionChainsRouter } from './evolution-chains';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'Hello!'),
  pokemon: pokemonRouter,
  types: pokemonTypesRouter,
  evolutionChains: evolutionChainsRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;

/**
 * All router Outputs
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Pokemon-specific router Outputs
 */
export type PokemonRouterOutputs = RouterOutputs['pokemon'];
export type PokemonListOutput = PokemonRouterOutputs['list'];

// Complete pokemon data
export type PokemonWithSpeciesOutput = PokemonRouterOutputs['pokemonWithSpecies'];
export type PokemonStats = PokemonWithSpeciesOutput['stats'];
// Random pokemon
export type FeaturedPokemonOutput = PokemonRouterOutputs['featured'];
export type FeaturedPokemon = FeaturedPokemonOutput[number];

// Simple Pokémon data for list returns
export type Pokemon = PokemonListOutput['pokemon'][number];
// Single artwork for a given pokemon
export type PokemonArtworkByNames = NonNullable<PokemonRouterOutputs['officialArtworkByNames']>;

/**
 * Pokemon Species-specific types
 */
// Complete pokemon species data
export type PokemonSpecies = PokemonWithSpeciesOutput['pokemonSpecies'];
export type PokemonSpeciesEvolutionChain = NonNullable<PokemonSpecies['evolutionChain']>;
export type PokemonInSpecies = PokemonSpecies['pokemon'][number];
export type PokemonMoves = PokemonInSpecies['moves'];
export type PokemonMove = PokemonMoves[number];
export type PokemonFlavorText = PokemonSpecies['flavorTexts'][number];

/**
 * PokemonEncounters types (subset of PokemonInSpecies)
 */
export type PokemonEncounters = PokemonInSpecies['encounters'];
export type PokemonEncounter = PokemonInSpecies['encounters'][number];
export type EncounterLocationArea = PokemonEncounters[number]['locationArea'];
export type EncounterLocation = EncounterLocationArea['location'];
export type EncounterVersionGroup = PokemonEncounters[number]['version']['versionGroup'];
export type EncounterConditions = PokemonEncounters[number]['conditionValueMap'];

/**
 * Pokedex types
 */
export type PokedexesByGeneration = NonNullable<PokemonRouterOutputs['pokedexByGeneration']>;
export type GenerationPokedex = PokedexesByGeneration['generations'][number];
export type NationalPokedex = PokedexesByGeneration['national'];
export type PokedexEntries = GenerationPokedex | NationalPokedex;
export type RegionalPokedexes = PokemonRouterOutputs['regionalPokedexesByGeneration'];

/**
 * Evolution Chains router Outputs
 */
export type EvolutionChainsRouterOutputs = RouterOutputs['evolutionChains'];
export type EvolutionChainsAllOutput = EvolutionChainsRouterOutputs['all'];
export type EvolutionChainsPaginatedOutput = EvolutionChainsRouterOutputs['paginated'];
export type EvolutionChainsBySpeciesIdOutput = EvolutionChainsRouterOutputs['bySpeciesId'];
export type EvolutionChainSingle = RouterOutputs['evolutionChains']['all'][number];
export type EvolutionSpecies = EvolutionChainSingle['pokemonSpecies'][number];
export type EvolutionConditions = EvolutionSpecies['pokemonEvolutions'][number];

/**
 * Pokemon types router Outputs
 */
export type TypeOutput = RouterOutputs['types'];
export type AllTypesOutput = TypeOutput['allTypes'];
export type PokemonType = AllTypesOutput[number];
export type PokemonTypeName = PokemonType['name'];
export type AllEfficaciesOutput = TypeOutput['getAllTypeEfficacies'];
export type PokemonByTypeOutput = TypeOutput['getPokemonByType'];
export type MovesByTypeOutput = TypeOutput['getMovesByType'];
