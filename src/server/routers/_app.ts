/**
 * This file contains the root router of the tRPC-backend
 */
import { inferRouterOutputs } from '@trpc/server';
import { createCallerFactory, publicProcedure, router } from '../trpc';
import { pokemonRouter } from './pokemon';
import { pokemonTypesRouter } from './pokemon-types';
import { evolutionChainsRouter } from './evolution-chains';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),

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
export type PokemonByIdOutput = PokemonRouterOutputs['byId'];
export type PokemonDetailedById = PokemonRouterOutputs['detailedById'];
export type PokemonByNameOutput = PokemonRouterOutputs['byName'];
export type DbStats = PokemonRouterOutputs['dbStats'];
export type PokemonByPokedexOutput = PokemonRouterOutputs['pokemonByPokedex'];
export type FeaturedPokemon = RouterOutputs['pokemon']['featured']['pokemon'][number];
export type Pokemon = PokemonListOutput['pokemon'][number];

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
export type AllEfficaciesOutput = TypeOutput['getAllTypeEfficacies'];
export type PokemonByTypeOutput = TypeOutput['getPokemonByType'];
export type MovesByTypeOutput = TypeOutput['getMovesByType'];
