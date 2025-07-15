import { useState } from 'react';
import Image from 'next/image';
import { PokemonInSpecies } from '~/server/routers/_app';
import PokemonSprites from './PokemonSprites';
import PokemonCries from './PokemonCries';

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
    <div className="flex flex-col md:flex-row gap-8 min-h-[400px] mb-6">
      {/* Official Artwork Section - Gradient restored */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg">
        {artworkUrl ? (
          <div className="relative w-full aspect-square max-w-[24rem]">
            <Image
              src={artworkUrl}
              alt={`${pokemonName} official artwork`}
              fill
              priority
              quality={100}
              sizes="384px" // Matches max-w-24rem exactly
              className="object-contain"
              // Critical optimizations:
              fetchPriority="high"
              loading="eager"
              crossOrigin="anonymous" // Required for GitHub CDN
            />
          </div>
        ) : (
          <div className="w-full aspect-square max-w-[24rem] flex items-center justify-center shadow-inner">
            <div className="text-gray-400 text-center p-4">
              <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              <p>No official artwork</p>
            </div>
          </div>
        )}
      </div>

      {/* Game Sprites Section */}
      <div className="h-96 w-full md:w-1/2 flex flex-col justify-around items-center p-4 gap-y-2">
        <PokemonSprites pokemon={pokemon} isShiny={isShiny} />
        <div className="flex justify-center items-center flex-wrap gap-x-4">
          {/* Shiny Toggle */}
          <div className="flex justify-center">
            <div className="flex bg-gray-200 dark:bg-gray-600 rounded-lg p-1">
              <button
                onClick={() => setIsShiny(false)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors text-nowrap ${
                  !isShiny
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setIsShiny(true)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors text-nowrap ${
                  isShiny
                    ? 'bg-yellow-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                ✨ Shiny
              </button>
            </div>
          </div>
          <PokemonCries criesLatest={pokemon.criesLatest} criesLegacy={pokemon.criesLegacy} />
        </div>
      </div>
    </div>
  );
};

export default PokemonArtwork;
