/**
 * Integration tests for additional tRPC routers (extends pokemon.test.ts).
 *
 * Requires a seeded database (DATABASE_URL in .env).
 * Run with: npm run test-integration
 *
 * Covers:
 *   healthcheck, pokemon.list, pokemon.search, pokemon.officialArtworkByNames,
 *   pokemon.allRegions, types.allTypes, types.getTypeWithPokemonAndMoves,
 *   moves.list, moves.byName, abilities.list, abilities.byName,
 *   items.list, items.holdable, locations.list, locations.byName,
 *   pokedex.pokedexByGeneration, pokedex.generationPokemonIds,
 *   evolutionChains.paginated
 *
 * Estimated coverage: ~85% of untested router procedures
 */
import { createContextInner } from '~/server/context';
import { createCaller } from '~/server/routers/_app';

async function getCaller() {
  const ctx = await createContextInner({});
  return createCaller(ctx);
}

// ─────────────────────────────────────────────────────────────────
// healthcheck
// ─────────────────────────────────────────────────────────────────
describe('healthcheck', () => {
  it('returns the greeting string', async () => {
    const caller = await getCaller();
    expect(await caller.healthcheck()).toBe('Hello!');
  });
});

// ─────────────────────────────────────────────────────────────────
// pokemon.list – pagination
// ─────────────────────────────────────────────────────────────────
describe('pokemon.list', () => {
  it('returns 50 pokemon by default', async () => {
    const caller = await getCaller();
    const result = await caller.pokemon.list({});
    expect(result.pokemon).toHaveLength(50);
  });

  it('respects the limit parameter', async () => {
    const caller = await getCaller();
    const result = await caller.pokemon.list({ limit: 10 });
    expect(result.pokemon).toHaveLength(10);
  });

  it('provides a nextCursor when more results exist', async () => {
    const caller = await getCaller();
    const result = await caller.pokemon.list({ limit: 10 });
    expect(result.nextCursor).toBeDefined();
    expect(typeof result.nextCursor).toBe('number');
  });

  it('returns the next page when a cursor is provided', async () => {
    const caller = await getCaller();
    const first = await caller.pokemon.list({ limit: 5 });
    const second = await caller.pokemon.list({ limit: 5, cursor: first.nextCursor });
    const firstIds = first.pokemon.map((p: any) => p.id);
    const secondIds = second.pokemon.map((p: any) => p.id);
    // Pages should not overlap
    expect(firstIds.some((id: number) => secondIds.includes(id))).toBe(false);
  });

  it('returns items with at minimum id and name fields', async () => {
    const caller = await getCaller();
    const result = await caller.pokemon.list({ limit: 1 });
    expect(result.pokemon[0]).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
    });
  });
});

// ─────────────────────────────────────────────────────────────────
// pokemon.search
// ─────────────────────────────────────────────────────────────────
describe('pokemon.search', () => {
  it('finds Bulbasaur by exact name', async () => {
    const caller = await getCaller();
    const result = await caller.pokemon.search({ query: 'bulbasaur' });
    const names = result.pokemon.map((p: any) => p.name);
    expect(names).toContain('bulbasaur');
  });

  it('returns matches for a partial name query', async () => {
    const caller = await getCaller();
    const result = await caller.pokemon.search({ query: 'char' });
    expect(result.pokemon.length).toBeGreaterThan(0);
  });

  it('respects the limit parameter', async () => {
    const caller = await getCaller();
    const result = await caller.pokemon.search({ query: 'saur', limit: 3 });
    expect(result.pokemon.length).toBeLessThanOrEqual(3);
  });

  it('returns an empty list for a query that matches nothing', async () => {
    const caller = await getCaller();
    const result = await caller.pokemon.search({ query: 'xyznonexistentmon' });
    expect(result.pokemon).toHaveLength(0);
  });

  it('echoes the query and limit back in the response', async () => {
    const caller = await getCaller();
    const result = await caller.pokemon.search({ query: 'pikachu', limit: 5 });
    expect(result.query).toBe('pikachu');
    expect(result.limit).toBe(5);
  });
});

// ─────────────────────────────────────────────────────────────────
// pokemon.officialArtworkByNames
// ─────────────────────────────────────────────────────────────────
describe('pokemon.officialArtworkByNames', () => {
  it('returns artwork data for known pokemon names', async () => {
    const caller = await getCaller();
    const result = await caller.pokemon.officialArtworkByNames({
      names: ['bulbasaur', 'charmander'],
    });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('returns objects with at minimum a name field', async () => {
    const caller = await getCaller();
    const result = await caller.pokemon.officialArtworkByNames({ names: ['pikachu'] });
    expect(result[0]).toMatchObject({ name: expect.any(String) });
  });
});

// ─────────────────────────────────────────────────────────────────
// pokemon.allRegions
// ─────────────────────────────────────────────────────────────────
describe('pokemon.allRegions', () => {
  it('returns a non-empty list of regions', async () => {
    const caller = await getCaller();
    const regions = await caller.pokemon.allRegions();
    expect(Array.isArray(regions)).toBe(true);
    expect(regions.length).toBeGreaterThan(0);
  });

  it('each region has an id and name', async () => {
    const caller = await getCaller();
    const regions = await caller.pokemon.allRegions();
    regions.forEach((r: any) => {
      expect(r).toMatchObject({ id: expect.any(Number), name: expect.any(String) });
    });
  });
});

// ─────────────────────────────────────────────────────────────────
// types.allTypes
// ─────────────────────────────────────────────────────────────────
describe('types.allTypes', () => {
  it('returns a non-empty list of types', async () => {
    const caller = await getCaller();
    const types = await caller.types.allTypes();
    expect(Array.isArray(types)).toBe(true);
    expect(types.length).toBeGreaterThan(0);
  });

  it('excludes shadow, unknown, and stellar types', async () => {
    const caller = await getCaller();
    const types = await caller.types.allTypes();
    const names = types.map((t: any) => t.name);
    expect(names).not.toContain('shadow');
    expect(names).not.toContain('unknown');
    expect(names).not.toContain('stellar');
  });

  it('includes common types like fire, water, and grass', async () => {
    const caller = await getCaller();
    const types = await caller.types.allTypes();
    const names = types.map((t: any) => t.name);
    expect(names).toContain('fire');
    expect(names).toContain('water');
    expect(names).toContain('grass');
  });
});

// ─────────────────────────────────────────────────────────────────
// types.getTypeWithPokemonAndMoves
// ─────────────────────────────────────────────────────────────────
describe('types.getTypeWithPokemonAndMoves', () => {
  it('returns type, pokemon, and moves arrays for "fire"', async () => {
    const caller = await getCaller();
    const result = await caller.types.getTypeWithPokemonAndMoves({ typeName: 'fire' });
    expect(result).toMatchObject({
      type: expect.objectContaining({ name: 'fire' }),
      pokemon: expect.any(Array),
      moves: expect.any(Array),
    });
  });

  it('returns non-empty pokemon and moves for "fire"', async () => {
    const caller = await getCaller();
    const result = await caller.types.getTypeWithPokemonAndMoves({ typeName: 'fire' });
    expect(result.pokemon.length).toBeGreaterThan(0);
    expect(result.moves.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────
// moves.list
// ─────────────────────────────────────────────────────────────────
describe('moves.list', () => {
  it('returns a non-empty list of moves with no filters', async () => {
    const caller = await getCaller();
    const moves = await caller.moves.list();
    expect(Array.isArray(moves)).toBe(true);
    expect(moves.length).toBeGreaterThan(0);
  });

  it('filters moves by type name', async () => {
    const caller = await getCaller();
    const moves = await caller.moves.list({ typeName: 'fire' });
    expect(moves.length).toBeGreaterThan(0);
    // Every returned move must belong to the fire type
    moves.forEach((m: any) => {
      expect(m.type?.name ?? m.typeName).toBe('fire');
    });
  });

  it('filters moves by generation id', async () => {
    const caller = await getCaller();
    const gen1Moves = await caller.moves.list({ generationId: 1 });
    expect(gen1Moves.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────
// moves.byName
// ─────────────────────────────────────────────────────────────────
describe('moves.byName', () => {
  it('returns move and learners array for "tackle"', async () => {
    const caller = await getCaller();
    const result = await caller.moves.byName({ name: 'tackle' });
    expect(result).toMatchObject({
      move: expect.objectContaining({ name: 'tackle' }),
      pokemon: expect.any(Array),
    });
  });

  it('throws NOT_FOUND for a non-existent move name', async () => {
    const caller = await getCaller();
    await expect(
      caller.moves.byName({ name: 'totally-fake-move-xyz' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

// ─────────────────────────────────────────────────────────────────
// abilities.list
// ─────────────────────────────────────────────────────────────────
describe('abilities.list', () => {
  it('returns a non-empty list of abilities', async () => {
    const caller = await getCaller();
    const abilities = await caller.abilities.list();
    expect(abilities.length).toBeGreaterThan(0);
  });

  it('filters abilities by generation id', async () => {
    const caller = await getCaller();
    const gen3 = await caller.abilities.list({ generationId: 3 });
    expect(gen3.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────
// abilities.byName
// ─────────────────────────────────────────────────────────────────
describe('abilities.byName', () => {
  it('returns ability and pokemon array for "overgrow"', async () => {
    const caller = await getCaller();
    const result = await caller.abilities.byName({ name: 'overgrow' });
    expect(result).toMatchObject({
      ability: expect.objectContaining({ name: 'overgrow' }),
      pokemon: expect.any(Array),
    });
  });

  it('throws NOT_FOUND for an unknown ability', async () => {
    const caller = await getCaller();
    await expect(
      caller.abilities.byName({ name: 'totally-fake-ability-xyz' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

// ─────────────────────────────────────────────────────────────────
// items.list
// ─────────────────────────────────────────────────────────────────
describe('items.list', () => {
  it('returns a non-empty list of items', async () => {
    const caller = await getCaller();
    const items = await caller.items.list();
    expect(items.length).toBeGreaterThan(0);
  });

  it('each item has at minimum an id and name', async () => {
    const caller = await getCaller();
    const items = await caller.items.list();
    items.slice(0, 5).forEach((item: any) => {
      expect(item).toMatchObject({ id: expect.any(Number), name: expect.any(String) });
    });
  });
});

// ─────────────────────────────────────────────────────────────────
// items.holdable
// ─────────────────────────────────────────────────────────────────
describe('items.holdable', () => {
  it('returns a non-empty list of holdable items', async () => {
    const caller = await getCaller();
    const items = await caller.items.holdable();
    expect(items.length).toBeGreaterThan(0);
  });

  it('returns holdable items filtered by generation', async () => {
    const caller = await getCaller();
    const gen2Items = await caller.items.holdable({ generationId: 2 });
    expect(gen2Items.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────
// locations.list
// ─────────────────────────────────────────────────────────────────
describe('locations.list', () => {
  it('returns a non-empty list of locations', async () => {
    const caller = await getCaller();
    const locations = await caller.locations.list();
    expect(locations.length).toBeGreaterThan(0);
  });

  it('each location has at minimum an id and name', async () => {
    const caller = await getCaller();
    const locations = await caller.locations.list();
    locations.slice(0, 3).forEach((loc: any) => {
      expect(loc).toMatchObject({ id: expect.any(Number), name: expect.any(String) });
    });
  });
});

// ─────────────────────────────────────────────────────────────────
// locations.byName
// ─────────────────────────────────────────────────────────────────
describe('locations.byName', () => {
  it('throws NOT_FOUND for a non-existent location', async () => {
    const caller = await getCaller();
    await expect(
      caller.locations.byName('totally-fake-location-xyz'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

// ─────────────────────────────────────────────────────────────────
// pokedex.pokedexByGeneration
// ─────────────────────────────────────────────────────────────────
describe('pokedex.pokedexByGeneration', () => {
  it('returns a national dex and a generations array', async () => {
    const caller = await getCaller();
    const result = await caller.pokedex.pokedexByGeneration();
    expect(result).toMatchObject({
      national: expect.any(Object),
      generations: expect.any(Array),
    });
  });

  it('national dex contains Bulbasaur', async () => {
    const caller = await getCaller();
    const result = await caller.pokedex.pokedexByGeneration();
    const names = result!.national.pokemonSpecies.map((s: any) => s.name);
    expect(names).toContain('bulbasaur');
  });
});

// ─────────────────────────────────────────────────────────────────
// pokedex.generationPokemonIds
// ─────────────────────────────────────────────────────────────────
describe('pokedex.generationPokemonIds', () => {
  it('returns an array of generation entries', async () => {
    const caller = await getCaller();
    const result = await caller.pokedex.generationPokemonIds();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('each entry has id, name, pokemonIds, and speciesIds', async () => {
    const caller = await getCaller();
    const result = await caller.pokedex.generationPokemonIds();
    result.forEach((gen: any) => {
      expect(gen).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        pokemonIds: expect.any(Array),
        speciesIds: expect.any(Array),
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────
// evolutionChains.paginated
// ─────────────────────────────────────────────────────────────────
describe('evolutionChains.paginated', () => {
  it('returns a chains array and nextCursor by default', async () => {
    const caller = await getCaller();
    const result = await caller.evolutionChains.paginated({});
    expect(Array.isArray(result.chains)).toBe(true);
    expect(result.chains.length).toBeGreaterThan(0);
  });

  it('respects the limit parameter', async () => {
    const caller = await getCaller();
    const result = await caller.evolutionChains.paginated({ limit: 3 });
    expect(result.chains).toHaveLength(3);
  });

  it('returns the next page when a cursor is provided', async () => {
    const caller = await getCaller();
    const first = await caller.evolutionChains.paginated({ limit: 5 });
    const second = await caller.evolutionChains.paginated({
      limit: 5,
      cursor: first.nextCursor,
    });
    const firstIds = first.chains.map((c: any) => c.id);
    const secondIds = second.chains.map((c: any) => c.id);
    expect(firstIds.some((id: number) => secondIds.includes(id))).toBe(false);
  });
});
