import React from 'react';
import type { PokemonInSpecies } from '~/server/routers/_app';
import TypeBadgesDisplay from '../pokemon-types/TypeBadgesDisplay';

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
  // Handle missing or incomplete data gracefully
  const spriteUrl = pokemon.sprites?.frontDefault || '';
  const types = pokemon.types.map((type) => type.type.name) || [];

  const styles = {
    container: 'p-4 w-full interactive-theme cursor-pointer',
    imageSize: 'w-16 h-16',
    spacing: 'space-x-4',
    nameSize: 'font-semibold',
    statusSize: 'text-sm',
  };

  const baseClasses = `card text-left  ${
    isActive ? 'info shadow-md' : 'border border-border hover:border-border-hover hover:shadow-sm'
  }`;

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
      aria-label={`Select ${pokemon.name}`}
      aria-pressed={isActive}
    >
      <div className={`flex items-center ${styles.spacing}`}>
        {/* Pokemon Sprite */}
        <div className={`${styles.imageSize} flex-shrink-0 flex items-center justify-center`}>
          {spriteUrl ? (
            <img
              src={spriteUrl}
              alt={pokemon.name}
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
        <div className="flex-1 min-w-0 flex flex-col items-start">
          {/* Name */}
          <h4
            className={`${styles.nameSize} capitalize text-gray-900 dark:text-gray-100 truncate capitalize`}
          >
            {pokemon.name}
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
