export interface AppConfig {
  STANDARD_PROXY_BASE_URL: string;
  POKEAPI_BASE_URL: string;
  RATE_LIMIT_MS: number;
  MAX_RETRIES: number;
  BATCH_SIZE: number;
  PREMIUM_PROXY: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
}

export interface ProgressCategory {
  completed: boolean;
  count: number;
  failed: number;
  expectedCount?: number;
}

export interface SeedingProgress {
  languages: ProgressCategory;
  generations: ProgressCategory;
  regions: ProgressCategory;
  types: ProgressCategory;
  abilities: ProgressCategory;
  moves: ProgressCategory;
  machines: ProgressCategory;
  items: ProgressCategory;
  pokemonSpecies: ProgressCategory;
  pokemon: ProgressCategory;
  evolutionChains: ProgressCategory;
  locations: ProgressCategory;
  locationAreas: ProgressCategory;
  encounters: ProgressCategory;
  flavorTexts: ProgressCategory;
  gameIndices: ProgressCategory;
  pokemonForms: ProgressCategory;
  versionGroups: ProgressCategory;
  pokedexes: ProgressCategory;
  characteristics: ProgressCategory;
  genders: ProgressCategory;
  natures: ProgressCategory;
  pokeathlonStats: ProgressCategory;
  palParkAreas: ProgressCategory;
  berries: ProgressCategory;
}

export interface ErrorLog {
  url: string;
  error: string;
  timestamp: Date;
}

export interface SeedingStats {
  totalRequests: number;
  failedRequests: number;
  startTime: Date | null;
  errors: ErrorLog[];
}

export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface APIResourceList {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}
