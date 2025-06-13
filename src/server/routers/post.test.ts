/**
 * Integration test example for the `pokemon` router
 */
import type { inferProcedureInput } from '@trpc/server';
import { createContextInner } from '../context';
import type { AppRouter } from './_app';
import { createCaller } from './_app';

test('get pokemon by id and name', async () => {
  const ctx = await createContextInner({});
  const caller = createCaller(ctx);

  // Test byId procedure
  const byIdInput: inferProcedureInput<AppRouter['pokemon']['byId']> = {
    id: 1, // Assuming Pokemon with ID 1 exists
  };

  const pokemonById = await caller.pokemon.byId(byIdInput);

  // Test byName procedure using the name from the byId result
  const byNameInput: inferProcedureInput<AppRouter['pokemon']['byName']> = {
    name: pokemonById.name,
  };

  const pokemonByName = await caller.pokemon.byName(byNameInput);

  // Both queries should return the same pokemon
  expect(pokemonById).toEqual(pokemonByName);

  // Test the structure matches your selector
  expect(pokemonById).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    height: expect.any(Number),
    weight: expect.any(Number),
    baseExperience: expect.any(Number),
    isDefault: expect.any(Boolean),
    sprites: expect.objectContaining({
      frontDefault: expect.any(String),
      frontShiny: expect.any(String),
      backDefault: expect.any(String),
      backShiny: expect.any(String),
    }),
    types: expect.arrayContaining([
      expect.objectContaining({
        slot: expect.any(Number),
        type: expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
        }),
      }),
    ]),
    abilities: expect.arrayContaining([
      expect.objectContaining({
        slot: expect.any(Number),
        isHidden: expect.any(Boolean),
        ability: expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
        }),
      }),
    ]),
    stats: expect.arrayContaining([
      expect.objectContaining({
        baseStat: expect.any(Number),
        effort: expect.any(Number),
        stat: expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
        }),
      }),
    ]),
    pokemonSpecies: expect.objectContaining({
      id: expect.any(Number),
      flavorTexts: expect.arrayContaining([
        expect.objectContaining({
          flavorText: expect.any(String),
        }),
      ]),
    }),
  });
});

test('list pokemon with pagination', async () => {
  const ctx = await createContextInner({});
  const caller = createCaller(ctx);

  const listInput: inferProcedureInput<AppRouter['pokemon']['list']> = {
    limit: 10,
    cursor: null,
  };

  const pokemonList = await caller.pokemon.list(listInput);

  expect(pokemonList).toMatchObject({
    pokemon: expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
      }),
    ]),
    nextCursor: expect.any(Number), // or null if no more pages
  });

  expect(pokemonList.pokemon.length).toBeLessThanOrEqual(10);
});

test('pokemon not found throws error', async () => {
  const ctx = await createContextInner({});
  const caller = createCaller(ctx);

  // Test byId with non-existent ID
  await expect(caller.pokemon.byId({ id: 999999 })).rejects.toThrow(
    "No pokemon with id '999999'",
  );

  // Test byName with non-existent name
  await expect(
    caller.pokemon.byName({ name: 'nonexistent-pokemon' }),
  ).rejects.toThrow("No pokemon with name 'nonexistent-pokemon'");
});
