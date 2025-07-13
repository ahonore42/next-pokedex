import { useState } from 'react';
import { capitalizeName } from '~/utils/text';
import { PokemonInSpecies } from '~/server/routers/_app';
import PokemonSprites from './PokemonSprites';

interface PokemonArtworkProps {
  pokemon: PokemonInSpecies;
}

const PokemonArtwork: React.FC<PokemonArtworkProps> = ({ pokemon }) => {
  const [isShiny, setIsShiny] = useState<boolean>(false);
  const pokemonName = capitalizeName(pokemon.name);

  // Get official artwork URL
  const getOfficialArtworkUrl = () => {
    const sprites = pokemon.sprites;
    if (!sprites) return '';
    return isShiny ? sprites.officialArtworkShiny : sprites.officialArtworkFront;
  };

  // Check if official artwork is available
  const hasOfficialArtwork =
    pokemon.sprites?.officialArtworkFront || pokemon.sprites?.officialArtworkShiny;

  return (
    <>
      {/* Main Content Container - Single Column */}
      <div className="flex flex-col gap-8 min-h-[400px]">
        {/* Official Artwork Section - Top */}
        <div className="w-full flex flex-col items-center justify-center">
          {hasOfficialArtwork && (
            <>
              <div className="w-full min-w-80 h-96 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center shadow-inner">
                {getOfficialArtworkUrl() ? (
                  <img
                    src={getOfficialArtworkUrl() || ''}
                    alt={`${pokemonName} official artwork ${isShiny ? '(shiny)' : ''}`}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p>No official artwork</p>
                  </div>
                )}
              </div>
              <div className="text-center mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Official Artwork
                </p>
              </div>
            </>
          )}
        </div>

        {/* Game Sprites Section - Bottom */}
        <PokemonSprites pokemon={pokemon} isShiny={isShiny} />
      </div>

      {/* Shiny Toggle */}
      <div className="mb-6 flex justify-center">
        <div className="flex bg-gray-200 dark:bg-gray-600 rounded-lg p-1">
          <button
            onClick={() => setIsShiny(false)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              !isShiny
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setIsShiny(true)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              isShiny
                ? 'bg-yellow-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            ✨ Shiny
          </button>
        </div>
      </div>
    </>
  );
};

export default PokemonArtwork;
