/**
 * This file contains the root router of the tRPC-backend
 */
import { inferRouterOutputs } from '@trpc/server';
import { createCallerFactory, publicProcedure, router } from '../trpc';
import { pokemonRouter } from './pokemon';
import { pokemonTypesRouter } from './pokemon-types';
import { evolutionChainsRouter } from './evolution-chains';
import { pokedexRouter } from './pokedex';
import { movesRouter } from './moves';
import { abilitiesRouter } from './abilities';
import { itemsRouter } from './items';
import { locationsRouter } from './locations';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'Hello!'),
  pokemon: pokemonRouter,
  types: pokemonTypesRouter,
  evolutionChains: evolutionChainsRouter,
  pokedex: pokedexRouter,
  moves: movesRouter,
  abilities: abilitiesRouter,
  items: itemsRouter,
  locations: locationsRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;

/**
 * ------------------------ All Router Outputs  -------------------------------
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * --------------------------- Pokémon types ----------------------------------
 */
export type PokemonRouterOutputs = RouterOutputs['pokemon'];
export type PokemonListOutput = PokemonRouterOutputs['list'];
// Complete pokemon data
export type PokemonWithSpeciesOutput = PokemonRouterOutputs['pokemonWithSpecies'];
// Random pokemon
export type FeaturedPokemonOutput = PokemonRouterOutputs['featured'];
export type FeaturedPokemon = FeaturedPokemonOutput[number];
// Simple Pokémon data for list returns
export type Pokemon = PokemonListOutput['pokemon'][number];
// Single artwork for a given pokemon
export type PokemonArtworkByNames = NonNullable<PokemonRouterOutputs['officialArtworkByNames']>;

/**
 * ----------------------- Pokémon Species types ------------------------------
 */
// Complete pokemon species data
export type PokemonSpecies = PokemonWithSpeciesOutput['pokemonSpecies'];
// Evolution chain is now loaded via evolutionChains.bySpeciesId (deferred query)
export type PokemonSpeciesEvolutionChain = NonNullable<RouterOutputs['evolutionChains']['bySpeciesId']>;
export type PokemonInSpecies = PokemonSpecies['pokemon'][number];
export type PokemonStats = PokemonInSpecies['stats'];
export type PokemonFlavorText = PokemonSpecies['flavorTexts'][number];

/**
 * ----------- Moves / Encounters — sourced from dedicated procedures ----------
 */
export type PokemonMoves = RouterOutputs['pokemon']['movesForPokemon'];
export type PokemonMove = PokemonMoves[number];
export type PokemonEncounters = RouterOutputs['pokemon']['encountersForPokemon'];
export type PokemonEncounter = PokemonEncounters[number];
export type EncounterLocationArea = PokemonEncounters[number]['locationArea'];
export type EncounterLocation = EncounterLocationArea['location'];
export type EncounterVersionGroup = PokemonEncounters[number]['version']['versionGroup'];
export type EncounterConditions = PokemonEncounters[number]['conditionValueMap'];

/**
 * --------------------------- Pokedex types -----------------------------------
 */
export type PokedexRouterOutputs = RouterOutputs['pokedex'];
export type PokedexesByGeneration = NonNullable<PokedexRouterOutputs['pokedexByGeneration']>;
export type GenerationPokedex = PokedexesByGeneration['generations'][number];
export type NationalPokedex = PokedexesByGeneration['national'];
export type PokedexEntries = GenerationPokedex | NationalPokedex;
export type RegionalPokedexes = PokedexRouterOutputs['regionalPokedexes'];
// Pokemon and species IDs by generation
export type GenerationPokemonIdsOutput = PokedexRouterOutputs['generationPokemonIds'];
export type GenerationWithPokemonIds = GenerationPokemonIdsOutput[number];


/**
 * ------------------------ Evolution Chain types -------------------------------
 */
export type EvolutionChainsRouterOutputs = RouterOutputs['evolutionChains'];
export type EvolutionChainsAllOutput = EvolutionChainsRouterOutputs['all'];
export type EvolutionChainsPaginatedOutput = EvolutionChainsRouterOutputs['paginated'];
export type EvolutionChainsBySpeciesIdOutput = EvolutionChainsRouterOutputs['bySpeciesId'];
export type EvolutionChainSingle = RouterOutputs['evolutionChains']['all'][number];
export type EvolutionSpecies = EvolutionChainSingle['pokemonSpecies'][number];
export type EvolutionConditions = EvolutionSpecies['pokemonEvolutions'][number];

/**
 * --------------------------- Moves types -------------------------------------
 */
export type MovesRouterOutputs = RouterOutputs['moves'];
export type MovesListOutput = MovesRouterOutputs['list'];
export type MoveDetailOutput = MovesRouterOutputs['byName'];
export type PokemonMovesetOutput = RouterOutputs['pokemon']['moveset'];
export type MovesetMove = PokemonMovesetOutput[number];
export type HoldableItemsOutput = RouterOutputs['items']['holdable'];
export type HoldableItem = HoldableItemsOutput[number];

/**
 * ------------------------- Abilities types -----------------------------------
 */
export type AbilitiesRouterOutputs = RouterOutputs['abilities'];
export type AbilitiesListOutput = AbilitiesRouterOutputs['list'];
export type AbilityListItem = AbilitiesListOutput[number];
export type AbilityDetailOutput = AbilitiesRouterOutputs['byName'];

/**
 * --------------------------- Items types -------------------------------------
 */
export type ItemsRouterOutputs = RouterOutputs['items'];
export type ItemsListOutput = ItemsRouterOutputs['list'];
export type ItemListItem = ItemsListOutput[number];
export type ItemDetailOutput = ItemsRouterOutputs['byName'];

/**
 * ------------------------- Locations types -----------------------------------
 */
export type LocationsRouterOutputs = RouterOutputs['locations'];
export type LocationsListOutput = LocationsRouterOutputs['list'];
export type LocationListItem = LocationsListOutput[number];
export type LocationDetailOutput = NonNullable<LocationsRouterOutputs['byName']>;
export type LocationDetailArea = LocationDetailOutput['areas'][number];
export type LocationAreaEncounter = LocationDetailArea['pokemonEncounters'][number];

/**
  * ------------------------- Pokémon Type types --------------------------------
 */
export type TypeRouterOutputs = RouterOutputs['types'];
export type AllTypesOutput = TypeRouterOutputs['allTypes'];
export type PokemonType = AllTypesOutput[number];
export type PokemonTypeName = PokemonType['name'];
export type AllEfficaciesOutput = TypeRouterOutputs['getAllTypeEfficacies'];
export type PokemonByTypeOutput = TypeRouterOutputs['getPokemonByType'];
export type MovesByTypeOutput = TypeRouterOutputs['getMovesByType'];
export type TypeWithPokemonAndMovesOutput = TypeRouterOutputs['getTypeWithPokemonAndMoves'];
export type TypeData = TypeWithPokemonAndMovesOutput['type'];
export type TypePokemon = TypeWithPokemonAndMovesOutput['pokemon'];
export type TypeMoves = TypeWithPokemonAndMovesOutput['moves'];
export type TypePokemonData = TypeWithPokemonAndMovesOutput['pokemon'][number];
export type TypeMoveData = TypeWithPokemonAndMovesOutput['moves'][number];
