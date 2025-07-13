import { capitalizeName } from '~/utils/text';
import { PokemonInSpecies } from '~/server/routers/_app';
import { TypeBadge } from '../ui/TypeBadge';

interface PokemonSpritesProps {
  pokemon: PokemonInSpecies;
  isShiny: boolean;
}

const PokemonSprites: React.FC<PokemonSpritesProps> = ({ pokemon, isShiny }) => {
  const pokemonName = capitalizeName(pokemon.name);

  // Check what sprites are available
  const getAvailableSprites = () => {
    const sprites = pokemon.sprites;
    if (!sprites) return { hasAny: false, hasBack: false, hasFront: false, hasFemale: false };

    const hasFront = !!(sprites.frontDefault || sprites.frontShiny);
    const hasBack = !!(sprites.backDefault || sprites.backShiny);
    const hasFemale = !!(
      sprites.frontFemale ||
      sprites.frontShinyFemale ||
      sprites.backFemale ||
      sprites.backShinyFemale
    );

    return {
      hasAny: hasFront || hasBack,
      hasFront,
      hasBack,
      hasFemale,
    };
  };

  // Check if Pokemon has female variants
  const hasFemaleSprites =
    pokemon.sprites?.frontFemale ||
    pokemon.sprites?.frontShinyFemale ||
    pokemon.sprites?.backFemale ||
    pokemon.sprites?.backShinyFemale;

  // Get sprite data for grid (modified to handle single sprite case)
  const getSpriteGridData = () => {
    const sprites = pokemon.sprites;
    if (!sprites) return [];

    const availableSprites = getAvailableSprites();

    if (hasFemaleSprites) {
      // Show 2x2 grid with male and female variants
      return [
        {
          label: 'Male Front',
          position: 'top-left',
          normal: sprites.frontDefault,
          shiny: sprites.frontShiny,
          genderSymbol: '♂',
          genderColor: 'text-blue-600 border-blue-300',
        },
        {
          label: 'Male Back',
          position: 'top-right',
          normal: sprites.backDefault,
          shiny: sprites.backShiny,
          genderSymbol: '♂',
          genderColor: 'text-blue-600 border-blue-300',
        },
        {
          label: 'Female Front',
          position: 'bottom-left',
          normal: sprites.frontFemale,
          shiny: sprites.frontShinyFemale,
          genderSymbol: '♀',
          genderColor: 'text-red-500 border-red-300',
        },
        {
          label: 'Female Back',
          position: 'bottom-right',
          normal: sprites.backFemale,
          shiny: sprites.backShinyFemale,
          genderSymbol: '♀',
          genderColor: 'text-red-500 border-red-300',
        },
      ];
    } else if (availableSprites.hasFront && !availableSprites.hasBack) {
      // Show single front sprite only
      return [
        {
          label: 'Game Sprite',
          position: 'center',
          normal: sprites.frontDefault,
          shiny: sprites.frontShiny,
          genderSymbol: null,
          genderColor: '',
        },
      ];
    } else {
      // Show 1x2 grid with front and back sprites
      return [
        {
          label: 'Front Sprite',
          position: 'left',
          normal: sprites.frontDefault,
          shiny: sprites.frontShiny,
          genderSymbol: null,
          genderColor: '',
        },
        {
          label: 'Back Sprite',
          position: 'right',
          normal: sprites.backDefault,
          shiny: sprites.backShiny,
          genderSymbol: null,
          genderColor: '',
        },
      ];
    }
  };

  const spriteGridData = getSpriteGridData();
  const availableSprites = getAvailableSprites();

  // Determine grid layout classes based on sprite availability
  const getGridClasses = () => {
    if (hasFemaleSprites) {
      return 'inline-grid grid-cols-2 gap-2'; // 2x2 grid for gender variants - small gap
    } else if (spriteGridData.length === 1) {
      return 'flex justify-center items-center w-full'; // Single sprite - fully centered
    } else {
      return 'inline-grid grid-cols-2 gap-2'; // 1x2 grid for front/back - small gap
    }
  };

  return (
    <>
      {/* Game Sprites Section */}
      <div className="w-full flex flex-col items-center justify-center">
        {/* Sprite Grid - Dynamic based on available sprites */}
        <div className="flex justify-center">
          <div
            className={`${getGridClasses()} ${spriteGridData.length > 1 ? 'items-center justify-items-center' : ''}`}
          >
            {spriteGridData.map((spriteData, index) => {
              const currentSprite = isShiny ? spriteData.shiny : spriteData.normal;
              const hasSprite = currentSprite && currentSprite !== null;
              const isLeftCol = index % 2 === 0;
              const showGenderSymbol = hasFemaleSprites && spriteData.genderSymbol;
              const isSingleSprite = spriteGridData.length === 1;

              return (
                <div key={index} className="flex flex-col items-center justify-center space-y-1">
                  {/* Sprite Container */}
                  <div
                    className={`${
                      isSingleSprite
                        ? 'w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56'
                        : 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36'
                    } bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 transition-transform hover:scale-105`}
                  >
                    {hasSprite ? (
                      <img
                        src={currentSprite}
                        alt={`${pokemonName} ${spriteData.label.toLowerCase()} ${isShiny ? 'shiny ' : ''}sprite`}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="text-gray-400 text-xs text-center">
                        <svg
                          className="w-6 h-6 mx-auto mb-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p>N/A</p>
                      </div>
                    )}
                  </div>

                  {/* Labels Below Images - All variants */}
                  <div className="flex items-center space-x-1">
                    {showGenderSymbol && (
                      <div className="w-3 h-3 flex items-center justify-center text-xs font-bold">
                        <span className={`${spriteData.genderColor}`}>
                          {spriteData.genderSymbol}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium text-center">
                      {hasFemaleSprites ? (isLeftCol ? 'Front' : 'Back') : spriteData.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* No sprites fallback */}
        {!availableSprites.hasAny && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>No game sprites available</p>
          </div>
        )}
      </div>

      {/* Form Sprites Section */}
      {pokemon.forms.length > 1 && (
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Forms</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pokemon.forms
              .filter((form) => !form.isDefault)
              .map((form) => (
                <div
                  key={form.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  {/* Form Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {form.names[0]?.name || capitalizeName(form.name)}
                    </h4>
                  </div>

                  {/* Form Types */}
                  <div className="flex gap-1 flex-wrap mb-3">
                    {form.types.map((typeInfo: any) => (
                      <div key={typeInfo.type.id} className="transform scale-75">
                        <TypeBadge type={typeInfo.type} />
                      </div>
                    ))}
                  </div>

                  {/* Form Sprites - Modified to handle single sprite case */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        label: 'Front',
                        normal: form.sprites?.frontDefault,
                        shiny: form.sprites?.frontShiny,
                      },
                      {
                        label: 'Back',
                        normal: form.sprites?.backDefault,
                        shiny: form.sprites?.backShiny,
                      },
                    ]
                      .filter((spriteSet) => {
                        // Only show back sprite if it exists
                        if (spriteSet.label === 'Back') {
                          return spriteSet.normal || spriteSet.shiny;
                        }
                        return true; // Always show front sprite slot
                      })
                      .map((spriteSet, index) => {
                        const currentSprite = isShiny ? spriteSet.shiny : spriteSet.normal;
                        const hasSprite = currentSprite && currentSprite !== null;

                        return (
                          <div key={index} className="flex flex-col items-center space-y-1">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                              {hasSprite ? (
                                <img
                                  src={currentSprite}
                                  alt={`${form.name} ${spriteSet.label.toLowerCase()} ${isShiny ? 'shiny ' : ''}sprite`}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <div className="text-gray-400 text-xs text-center">
                                  <svg
                                    className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <p className="text-xs">N/A</p>
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
                              {spriteSet.label}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default PokemonSprites;
