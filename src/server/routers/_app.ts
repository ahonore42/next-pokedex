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
export type PokemonDetailedByIdOutput = PokemonRouterOutputs['detailedById'];
export type PokemonByNameOutput = PokemonRouterOutputs['byName'];
export type DbStatsOutput = RouterOutputs['pokemon']['dbStats'];

/**
 * Individual Pokemon types
 */
export type Pokemon = PokemonListOutput['pokemon'][number];
export type PokemonDetailed = PokemonDetailedByIdOutput;
