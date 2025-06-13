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

// Extract all router output types
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Specific Pokemon types
export type PokemonListResponse = RouterOutputs['pokemon']['list'];
export type PokemonById = RouterOutputs['pokemon']['byId'];
export type PokemonByName = RouterOutputs['pokemon']['byName'];
// Extract just the pokemon array
export type PokemonArray = PokemonListResponse['pokemon'];

// // Extract individual Pokemon type
// type Pokemon = PokemonArray[number];
// // or alternatively:
// type Pokemon = PokemonListResponse['pokemon'][number];
