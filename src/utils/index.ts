export * from './colors';
export * from './encounters';
export * from './evolutions';
export * from './pokemon';
export * from './pokemon-types';
export * from './pokemon-stats';
export * from './pokedex';
export * from './text';

export function getOrCreateMapArray<K, V>(map: Map<K, V[]>, key: K): V[] {
  if (!map.has(key)) map.set(key, []);
  return map.get(key)!;
}
