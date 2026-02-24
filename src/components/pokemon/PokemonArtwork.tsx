import { useState } from 'react';
import { PokemonInSpecies } from '~/server/routers/_app';
import PokemonSprites from './PokemonSprites';
import ShinyToggle from './ShinyToggle';
import ArtworkImage from '../ui/ArtworkImage';

interface PokemonArtworkProps {
  pokemon: PokemonInSpecies;
}

const PokemonArtwork: React.FC<PokemonArtworkProps> = ({ pokemon }) => {
  const [isShiny, setIsShiny] = useState<boolean>(false);
  const pokemonName = pokemon.name;

  // Directly compute artwork URL - faster than function call
  const artworkUrl = isShiny
    ? pokemon.sprites?.officialArtworkShiny
    : pokemon.sprites?.officialArtworkFront;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Official Artwork Section - Gradient restored */}
      <div className="w-full h-96 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg">
        <ArtworkImage
          src={artworkUrl || ''}
          alt={`Official ${pokemonName} Artwork`}
          size="size-96"
        />
      </div>

      {/* Game Sprites Section */}
      <div className="w-full flex flex-col justify-between items-center gap-y-4">
        <PokemonSprites pokemon={pokemon} isShiny={isShiny} />
        {/* Shiny Toggle */}
        <ShinyToggle isShiny={isShiny} setIsShiny={setIsShiny} />
      </div>
    </div>
  );
};

export default PokemonArtwork;
