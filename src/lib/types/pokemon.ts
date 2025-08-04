export type PokemonListSprites = {
  frontDefault?: string | null;
  frontShiny?: string | null;
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
  sprites: PokemonListSprites;
  types: string[];
  abilities: PokemonListAbility[];
  stats: PokemonListStat[];
};
