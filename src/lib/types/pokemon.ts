export type PokemonListSprites = {
  frontDefault?: string | null;
  frontShiny?: string | null;
  frontFemale?: string | null;
  frontShinyFemale?: string | null;
};

export type PokemonListAbility = {
  ability: {
    id: number;
    name: string;
    names: {
      name: string;
    }[];
  };
  slot: number;
  isHidden: boolean;
};

export type PokemonListStat = {
  stat: {
    id: number;
    name: string;
  };
  baseStat: number;
};

export type PokemonListData = {
  pokemonId: number;
  speciesId: number;
  name: string;
  genderRate: number;
  sprites: PokemonListSprites;
  types: string[];
  abilities: PokemonListAbility[];
  stats: PokemonListStat[];
};
