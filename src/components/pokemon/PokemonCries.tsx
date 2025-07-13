import { PokemonInSpecies } from '~/server/routers/_app';

interface PokemonCriesProps {
  criesLatest: PokemonInSpecies['criesLatest'];
  criesLegacy: PokemonInSpecies['criesLegacy'];
}

const PokemonCries: React.FC<PokemonCriesProps> = ({ criesLatest, criesLegacy }) => {
  const handlePlayCry = (cryUrl: string) => {
    try {
      new Audio(cryUrl).play();
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

  // Only render if there are cries available
  if (!criesLatest && !criesLegacy) {
    return null;
  }

  return (
    <div className="flex space-x-2">
      {criesLatest && (
        <button
          onClick={() => handlePlayCry(criesLatest)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="Play latest cry"
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
      {criesLegacy && (
        <button
          onClick={() => handlePlayCry(criesLegacy)}
          className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          aria-label="Play legacy cry"
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
  );
};

export default PokemonCries;
