/**
 * This file contains the root router of the tRPC-backend
 */
import { inferRouterOutputs } from '@trpc/server';
import { createCallerFactory, publicProcedure, router } from '../trpc';
import { pokemonRouter } from './pokemon';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),

  pokemon: pokemonRouter,
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

// New: Type for the output of pokemonByPokedex
export type PokemonByPokedexOutput = PokemonRouterOutputs['pokemonByPokedex'];

export type FeaturedPokemon = RouterOutputs['pokemon']['featured']['pokemon'][number];

/**
 * Individual Pokemon types
 */
// Use PokemonListOutput for the base Pokemon type, as it's the most comprehensive for lists
export type Pokemon = PokemonListOutput['pokemon'][number];
