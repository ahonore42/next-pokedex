import { parseGenerationToNumber } from '~/utils/pokemon';
import { PokemonSpeciesByIdOutput } from '~/server/routers/_app';
import SpecialAttributes from './SpecialAttributes';

interface PokemonFlavorTextProps {
  species: PokemonSpeciesByIdOutput;
}

const PokemonFlavorText: React.FC<PokemonFlavorTextProps> = ({ species }) => {
  // Get latest flavor text
  const flavorText = species.flavorTexts[0]?.flavorText || 'No description available.';

  return (
    <>
      {/* Generation and Region */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
        <span>Generation {parseGenerationToNumber(species.generation.name)}</span>
        {species.generation.mainRegion && (
          <>
            <span>•</span>
            <span className="capitalize">{species.generation.mainRegion.name} Region</span>
          </>
        )}
        {/* Special Attributes */}
        <SpecialAttributes species={species} />
      </div>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{flavorText}</p>
      {species.flavorTexts[0]?.version && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          — {species.flavorTexts[0].version.names[0]?.name || species.flavorTexts[0].version.name}
        </p>
      )}
    </>
  );
};

export default PokemonFlavorText;
