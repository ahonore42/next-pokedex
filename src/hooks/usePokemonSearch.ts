import { useMemo } from 'react';
import { PokemonListData } from '~/lib/types';
import { usePokemonCache } from '~/lib/contexts/PokedexCacheContext';

export function usePokemonSearch(query: string, limit = 200) {
  const { pokemonDataArray } = usePokemonCache();

  return useMemo(() => {
    if (!query.trim()) return [];

    const lower = query.toLowerCase();
    const results: PokemonListData[] = [];

    for (const pokemon of pokemonDataArray) {
      if (results.length >= limit) break;

      // Name match
      if (pokemon.name.toLowerCase().includes(lower)) {
        results.push(pokemon);
        continue;
      }

      // Species ID match
      if (pokemon.speciesId.toString().includes(query.trim())) {
        results.push(pokemon);
        continue;
      }

      // Type match
      if (pokemon.types.some((type) => type.toLowerCase().includes(lower))) {
        results.push(pokemon);
        continue;
      }

      // Ability match
      if (
        pokemon.abilities.some(
          (abilityData) =>
            abilityData.ability.name.toLowerCase().includes(lower) ||
            abilityData.ability.names.some((nameData) =>
              nameData.name.toLowerCase().includes(lower),
            ),
        )
      ) {
        results.push(pokemon);
      }
    }

    return results;
  }, [pokemonDataArray, query, limit]);
}
