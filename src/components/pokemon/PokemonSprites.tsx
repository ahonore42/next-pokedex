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
          label: 'Front',
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
          label: 'Front',
          position: 'left',
          normal: sprites.frontDefault,
          shiny: sprites.frontShiny,
          genderSymbol: null,
          genderColor: '',
        },
        {
          label: 'Back',
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
      return 'grid grid-cols-2 gap-4'; // 2x2 grid for gender variants
    } else if (spriteGridData.length === 1) {
      return 'flex justify-center items-center'; // Single sprite - fully centered
    } else {
      return 'grid grid-cols-2 gap-4 items-center justify-center'; // 1x2 grid for front/back
    }
  };

  return (
    <div className="h-full flex justify-center items-center">
      {/* Sprite Grid - Dynamic based on available sprites */}
      <div
        className={`${getGridClasses()} ${spriteGridData.length > 1 ? 'items-center justify-items-center' : ''}`}
      >
        {spriteGridData.map((spriteData, index) => {
          const currentSprite = isShiny ? spriteData.shiny : spriteData.normal;
          const isLeftCol = index % 2 === 0;
          const showGenderSymbol = hasFemaleSprites && spriteData.genderSymbol;
          return (
            <div key={index} className="flex items-center justify-center">
              <Sprite src={currentSprite || ''} variant="lg" className="">
                {showGenderSymbol && (
                  <span className={`${spriteData.genderColor} text-xs`}>
                    {spriteData.genderSymbol}
                  </span>
                )}
                <span className="text-xs text-subtle">
                  {hasFemaleSprites ? (isLeftCol ? 'Front' : 'Back') : spriteData.label}
                </span>
              </Sprite>
            </div>
          );
        })}
      </div>
      {/* No sprites fallback */}
      {!availableSprites.hasAny && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <p>No game sprites available</p>
        </div>
      )}
    </div>
  );
};

export default PokemonSprites;
