import React from 'react';
import PokemonButton from './PokemonButton';
import type { PokemonInSpecies } from '~/server/routers/_app';
import SectionCard from '../ui/SectionCard';

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
    <SectionCard
      title={`${speciesName} Variants`}
      variant="wide"
      colorVariant="transparent"
      className="flex-1"
    >
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
    </SectionCard>
  );
};

export default PokemonFormSwitcher;
