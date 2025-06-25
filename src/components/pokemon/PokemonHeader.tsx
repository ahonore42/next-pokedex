import { useState } from 'react';
import { capitalizeName, getTypeColor } from '~/utils/pokemon';
import type { RouterOutputs } from '~/server/routers/_app';

type PokemonDetailData = RouterOutputs['pokemon']['detailedById'];

interface PokemonHeaderProps {
  pokemon: PokemonDetailData;
}

const PokemonHeader: React.FC<PokemonHeaderProps> = ({ pokemon }) => {
  const [currentSprite, setCurrentSprite] = useState<string>('front');
  const [isShiny, setIsShiny] = useState<boolean>(false);
  const species = pokemon.pokemonSpecies;
  const pokemonName = capitalizeName(pokemon.name);
  const speciesName = pokemon.pokemonSpecies.names[0]?.name || pokemonName;
  const genus = pokemon.pokemonSpecies.names[0]?.genus || '';

  // Get sprite URLs based on current selection
  const getSpriteUrl = () => {
    const sprites = pokemon.sprites;
    if (!sprites) return '';

    if (currentSprite === 'front') {
      return isShiny ? sprites.frontShiny : sprites.frontDefault;
    } else {
      return isShiny ? sprites.backShiny : sprites.backDefault;
    }
  };

  // Get latest flavor text
  const flavorText =
    pokemon.pokemonSpecies.flavorTexts[0]?.flavorText || 'No description available.';

  // Get main dex number (National Dex)
  const nationalDexNumber =
    pokemon.pokemonSpecies.pokedexNumbers.find(
      (entry) => entry.pokedex.isMainSeries && entry.pokedex.name === 'national',
    )?.pokedexNumber || pokemon.id;

  // Physical characteristics
  const heightInMeters = pokemon.height / 10;
  const weightInKg = pokemon.weight / 10;
  const heightInFeet = Math.floor(heightInMeters * 3.28084);
  const heightInInches = Math.round((heightInMeters * 39.3701) % 12);
  const weightInLbs = Math.round(weightInKg * 2.20462);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Sprites and Controls */}
        <div className="flex flex-col items-center space-y-4">
          {/* Main Sprite Display */}
          <div className="relative">
            <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              {getSpriteUrl() ? (
                <img
                  src={getSpriteUrl() || ''}
                  alt={`${pokemonName} ${currentSprite} sprite`}
                  className="w-full h-full object-contain"
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
                  <p>No sprite available</p>
                </div>
              )}
            </div>

            {/* Sprite Controls */}
            <div className="mt-4 flex justify-center space-x-4">
              <div className="flex bg-gray-200 dark:bg-gray-600 rounded-lg p-1">
                <button
                  onClick={() => setCurrentSprite('front')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    currentSprite === 'front'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  Front
                </button>
                <button
                  onClick={() => setCurrentSprite('back')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    currentSprite === 'back'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  Back
                </button>
              </div>

              <div className="flex bg-gray-200 dark:bg-gray-600 rounded-lg p-1">
                <button
                  onClick={() => setIsShiny(false)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    !isShiny
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setIsShiny(true)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    isShiny
                      ? 'bg-yellow-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  ✨ Shiny
                </button>
              </div>
            </div>
          </div>

          {/* Audio Cries */}
          {(pokemon.criesLatest || pokemon.criesLegacy) && (
            <div className="flex space-x-2">
              {pokemon.criesLatest && (
                <button
                  onClick={() => new Audio(pokemon.criesLatest!).play()}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.82L4.464 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.464l3.919-3.82a1 1 0 011.617.82z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Latest Cry
                </button>
              )}
              {pokemon.criesLegacy && (
                <button
                  onClick={() => new Audio(pokemon.criesLegacy!).play()}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.82L4.464 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.464l3.919-3.82a1 1 0 011.617.82z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Legacy Cry
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Pokemon Info */}
        <div className="space-y-6">
          {/* Title and Basic Info */}
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{speciesName}</h1>
              <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
                #{nationalDexNumber.toString().padStart(3, '0')}
              </span>
            </div>

            {genus && <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{genus}</p>}

            {/* Types */}
            <div className="flex flex-wrap gap-2 mb-4">
              {pokemon.types.map((pokemonType) => (
                <span
                  key={pokemonType.type.name}
                  className="px-3 py-1 rounded-full text-white font-medium text-sm"
                  style={{ backgroundColor: getTypeColor(pokemonType.type.name) }}
                >
                  {pokemonType.type.names[0]?.name || pokemonType.type.name.toUpperCase()}
                </span>
              ))}
            </div>

            {/* Generation and Region */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
              <span>Generation {pokemon.pokemonSpecies.generation.name}</span>
              {pokemon.pokemonSpecies.generation.mainRegion && (
                <>
                  <span>•</span>
                  <span>{pokemon.pokemonSpecies.generation.mainRegion.name} Region</span>
                </>
              )}
            </div>
          </div>

          {/* Flavor Text */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pokédex Entry</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{flavorText}</p>
            {pokemon.pokemonSpecies.flavorTexts[0]?.version && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                —{' '}
                {pokemon.pokemonSpecies.flavorTexts[0].version.names[0]?.name ||
                  pokemon.pokemonSpecies.flavorTexts[0].version.name}
              </p>
            )}
          </div>

          {/* Physical Characteristics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Height</h4>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {heightInMeters.toFixed(1)} m
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {heightInFeet}'{heightInInches}"
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Weight</h4>
              <p className="text-lg text-gray-700 dark:text-gray-300">{weightInKg.toFixed(1)} kg</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{weightInLbs} lbs</p>
            </div>
          </div>

          {/* Special Attributes */}
          <div className="flex flex-wrap gap-2">
            {pokemon.pokemonSpecies.isLegendary && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                Legendary
              </span>
            )}
            {pokemon.pokemonSpecies.isMythical && (
              <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">
                Mythical
              </span>
            )}
            {pokemon.pokemonSpecies.isBaby && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Baby
              </span>
            )}
            {pokemon.pokemonSpecies.hasGenderDifferences && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Gender Differences
              </span>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Breeding</h2>

          <div className="space-y-4">
            {/* Egg Groups */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Egg Groups</h3>
              <div className="flex flex-wrap gap-2">
                {species.eggGroups.map((eggGroupEntry) => (
                  <span
                    key={eggGroupEntry.eggGroup.id}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                  >
                    {eggGroupEntry.eggGroup.names[0]?.name ||
                      capitalizeName(eggGroupEntry.eggGroup.name)}
                  </span>
                ))}
              </div>
            </div>

            {/* Gender Rate */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Gender Ratio</h3>
              <div className="text-gray-700 dark:text-gray-300">
                {species.genderRate === -1 ? (
                  <span>Genderless</span>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>♂ {(((8 - species.genderRate) / 8) * 100).toFixed(1)}%</span>
                    <span>♀ {((species.genderRate / 8) * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hatch Counter */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Hatch Time</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {species.hatchCounter} cycles ({species.hatchCounter * 256} steps)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonHeader;
