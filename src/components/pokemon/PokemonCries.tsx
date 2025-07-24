import { PokemonInSpecies } from '~/server/routers/_app';
import Button from '../ui/buttons';

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
        <Button
          onClick={() => handlePlayCry(criesLatest)}
          variant="primary"
          size="md"
          className="text-nowrap"
          aria-label="Play latest cry"
          iconLeft="microphone"
        >
          Latest Cry
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
          Legacy Cry
        </Button>
      )}
    </div>
  );
};

export default PokemonCries;
