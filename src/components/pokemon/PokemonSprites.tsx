import { PokemonInSpecies } from '~/server/routers/_app';
import Sprite from '../ui/Sprite';

interface PokemonSpritesProps {
  pokemon: PokemonInSpecies;
  isShiny: boolean;
}

const PokemonSprites: React.FC<PokemonSpritesProps> = ({ pokemon, isShiny }) => {
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
      return 'inline-grid grid-cols-2 gap-3'; // 2x2 grid for gender variants
    } else if (spriteGridData.length === 1) {
      return 'flex justify-center items-center w-full'; // Single sprite - fully centered
    } else {
      return 'inline-grid grid-cols-2 gap-3'; // 1x2 grid for front/back
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

              return (
                <div key={index} className="flex flex-col items-center justify-center space-y-2">
                  {/* Sprite Container - UNIFORM SIZING */}
                  <div
                    className="w-36 h-36 bg-gray-100 flex items-center justify-center dark:bg-gray-700 rounded-lg   
                    transition-transform hover:scale-105"
                  >
                    {hasSprite ? (
                      <Sprite src={currentSprite} variant="lg" />
                    ) : (
                      <Sprite variant="lg" fallback />
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
    </>
  );
};

export default PokemonSprites;
