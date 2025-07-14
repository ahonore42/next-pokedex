import React from 'react';
import PokemonButton from './PokemonButton';
import type { PokemonInSpecies } from '~/server/routers/_app';

interface PokemonFormSwitcherProps {
  speciesPokemon: PokemonInSpecies[];
  speciesName: string;
  activePokemon: PokemonInSpecies;
  onPokemonSwitch: (pokemonId: number) => void;
}

const PokemonFormSwitcher: React.FC<PokemonFormSwitcherProps> = ({
  speciesPokemon,
  speciesName,
  activePokemon,
  onPokemonSwitch,
}) => {
  // Don't render if there's only one Pokemon
  if (!speciesPokemon || speciesPokemon.length <= 1) {
    return null;
  }

  return (
    <div className="mb-6 flex-1">
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          {speciesName} Variants
        </h3>
      </div>
      <div
        className="grid gap-4 w-full"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        }}
      >
        {[...speciesPokemon]
          .sort((a, b) => a.id - b.id)
          .map((pokemon) => (
            <PokemonButton
              key={pokemon.id}
              pokemon={pokemon}
              isActive={activePokemon.id === pokemon.id}
              onClick={() => onPokemonSwitch(pokemon.id)}
            />
          ))}
      </div>
    </div>
  );
};

export default PokemonFormSwitcher;
