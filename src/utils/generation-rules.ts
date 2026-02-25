export interface GenFeatures {
  hasAbilities: boolean;
  hasNatures: boolean;
  hasHeldItems: boolean;
  hasEvCap: boolean;
  hasGender: boolean;
  hasShiny: boolean;
  hasTera: boolean;
  ivMax: number;
}

export function getGenFeatures(gen: number): GenFeatures {
  return {
    hasAbilities: gen >= 3,
    hasNatures: gen >= 3,
    hasHeldItems: gen >= 2,
    hasEvCap: gen >= 3,
    hasGender: gen >= 2,
    hasShiny: gen >= 2,
    hasTera: gen >= 9,
    ivMax: gen <= 2 ? 15 : 31,
  };
}
