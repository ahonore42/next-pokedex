/**
 * Integration tests for the tRPC router.
 * Requires a seeded database (DATABASE_URL in .env).
 */
import { createContextInner } from '~/server/context';
import { createCaller } from '~/server/routers/_app';

async function getCaller() {
  const ctx = await createContextInner({});
  return createCaller(ctx);
}

describe('pokemon.pokemonWithSpecies', () => {
  it('fetches Bulbasaur by id', async () => {
    const caller = await getCaller();
    const result = await caller.pokemon.pokemonWithSpecies({ id: 1, name: undefined });

    expect(result).toMatchObject({
      id: 1,
      name: 'bulbasaur',
      pokemonSpecies: expect.objectContaining({
        id: expect.any(Number),
      }),
    });
  });

  it('fetches the same Pokémon by name', async () => {
    const caller = await getCaller();
    const byId = await caller.pokemon.pokemonWithSpecies({ id: 1, name: undefined });
    const byName = await caller.pokemon.pokemonWithSpecies({ id: undefined, name: 'bulbasaur' });
    expect(byId.id).toBe(byName.id);
  });

  it('throws NOT_FOUND for an unknown Pokémon', async () => {
    const caller = await getCaller();
    await expect(
      caller.pokemon.pokemonWithSpecies({ id: 999999, name: undefined }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('evolutionChains.bySpeciesId', () => {
  it('returns a chain for Bulbasaur (species 1)', async () => {
    const caller = await getCaller();
    const chain = await caller.evolutionChains.bySpeciesId({ speciesId: 1 });

    expect(chain).not.toBeNull();
    expect(chain!.pokemonSpecies.length).toBeGreaterThanOrEqual(1);
    // Every species in the chain must have an id and name
    chain!.pokemonSpecies.forEach((s: { id: unknown; name: unknown }) => {
      expect(s).toMatchObject({ id: expect.any(Number), name: expect.any(String) });
    });
  });

  it('returns null for a non-existent species', async () => {
    const caller = await getCaller();
    const chain = await caller.evolutionChains.bySpeciesId({ speciesId: 999999 });
    expect(chain).toBeNull();
  });
});

describe('pokemon.featured', () => {
  it('returns a non-empty list of featured Pokémon', async () => {
    const caller = await getCaller();
    const featured = await caller.pokemon.featured();
    expect(Array.isArray(featured)).toBe(true);
    expect(featured.length).toBeGreaterThan(0);
  });
});
