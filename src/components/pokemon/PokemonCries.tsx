import { PokemonInSpecies } from '~/server/routers/_app';
import Button from '../ui/buttons';
import SectionCard from '../ui/SectionCard';

interface PokemonCriesProps {
  criesLatest: PokemonInSpecies['criesLatest'];
  criesLegacy: PokemonInSpecies['criesLegacy'];
  className?: string;
}

const PokemonCries: React.FC<PokemonCriesProps> = ({ criesLatest, criesLegacy, className }) => {
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
    <SectionCard variant="compact" title="Pokemon Cries" className={className}>
      <div className="flex items-center justify-center gap-2">
        {criesLatest && (
          <Button
            onClick={() => handlePlayCry(criesLatest)}
            variant="primary"
            size="md"
            className="text-nowrap"
            aria-label="Play latest cry"
            iconLeft="microphone"
          >
            Latest
          </Button>
        )}
        {criesLegacy && (
          <Button
            onClick={() => handlePlayCry(criesLegacy)}
            variant="secondary"
            size="md"
            className="text-nowrap"
            aria-label="Play legacy cry"
            iconLeft="microphone"
          >
            Legacy
          </Button>
        )}
      </div>
    </SectionCard>
  );
};

export default PokemonCries;
