import React from 'react';
import PokemonButton from './PokemonButton';
import type { PokemonInSpecies } from '~/server/routers/_app';

interface PokemonFormSwitcherProps {
  speciesPokemon: PokemonInSpecies[];
  speciesName: string;
  activePokemon: PokemonInSpecies;
  onPokemonSwitch: (pokemonId: number) => void;
  className?: string;
}

const PokemonFormSwitcher: React.FC<PokemonFormSwitcherProps> = ({
  speciesPokemon,
  speciesName,
  activePokemon,
  onPokemonSwitch,
  className = '',
}) => {
  // Don't render if there's only one Pokemon
  if (!speciesPokemon || speciesPokemon.length <= 1) {
    return null;
  }

  return (
    <div className={`mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      {/* Pokemon Switcher */}
      <div className="mb-6">
        <div className="flex w-full justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            {speciesName} Variants
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            Currently viewing: {activePokemon.name}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
};

export default PokemonFormSwitcher;
