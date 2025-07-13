import React from 'react';
import type { PokemonInSpecies } from '~/server/routers/_app';
import { capitalizeName } from '~/utils/text';
import TypeBadgesDisplay from './TypeBadgesDisplay';

interface PokemonButtonProps {
  pokemon: PokemonInSpecies;
  isActive?: boolean;
  onClick: () => void;
  showTypes?: boolean;
  showStatus?: boolean;
  className?: string;
}

const PokemonButton: React.FC<PokemonButtonProps> = ({
  pokemon,
  isActive = false,
  onClick,
  showTypes = true,
  showStatus = true,
  className = '',
}) => {
  const pokemonName = capitalizeName(pokemon.name);

  // Handle missing or incomplete data gracefully
  const spriteUrl = pokemon.sprites?.frontDefault || '';
  const types = pokemon.types || [];

  const styles = {
    container: 'p-4',
    imageSize: 'w-16 h-16',
    spacing: 'space-x-4',
    nameSize: 'font-semibold',
    statusSize: 'text-sm',
  };

  // // Base button classes
  // const baseClasses = `
  //   border rounded-lg transition-all text-left cursor-pointer
  //   hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  //   disabled:opacity-50 disabled:cursor-not-allowed
  // `;

  const baseClasses = `border rounded-lg p-4 transition-all text-left ${
    isActive
      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
  }`;

  // // Active/inactive state classes
  // const stateClasses = isActive
  //   ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
  //   : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600';

  // Error handling for onClick
  const handleClick = () => {
    try {
      onClick();
    } catch (error) {
      console.error('Error in PokemonButton onClick:', error);
    }
  };

  // Error handling for missing sprite
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses}  ${styles.container} ${className}`}
      aria-label={`Select ${pokemonName}`}
      aria-pressed={isActive}
    >
      <div className={`flex items-center ${styles.spacing}`}>
        {/* Pokemon Sprite */}
        <div className={`${styles.imageSize} flex-shrink-0 flex items-center justify-center`}>
          {spriteUrl ? (
            <img
              src={spriteUrl}
              alt={pokemonName}
              className={`${styles.imageSize} object-contain`}
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div
              className={`${styles.imageSize} bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center`}
            >
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Pokemon Info */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h4 className={`${styles.nameSize} capitalize text-gray-900 dark:text-gray-100 truncate`}>
            {pokemonName}
          </h4>

          {/* Status indicator */}
          {showStatus && (
            <p className={`${styles.statusSize} text-gray-600 dark:text-gray-400 truncate`}>
              {pokemon.isDefault ? 'Default' : 'Variant'}
            </p>
          )}

          {/* Types */}
          {showTypes && types.length > 0 && <TypeBadgesDisplay types={types} link={false} />}
        </div>
      </div>
    </button>
  );
};

export default PokemonButton;
