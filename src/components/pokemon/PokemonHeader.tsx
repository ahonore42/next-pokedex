import EvolutionChain from '../evolutions/EvolutionChain';
import PokemonArtwork from './PokemonArtwork';
import { PokemonSpecies } from '~/server/routers/_app';
import SectionCard from '../ui/SectionCard';
import PokemonAbilities from './PokemonAbilities';
import MobileEvolutionChain from '../evolutions/MobileEvolutionChain';
import PokemonFlavorText from './PokemonFlavorText';
import PokemonFormSwitcher from './PokemonFormSwitcher';
import PokemonBaseStats from './PokemonBaseStats';
import PokemonStatTable from './PokemonStatTable';
import { useBreakpointWidth } from '~/hooks';
import PokemonInfo from './PokemonInfo';

interface PokemonHeaderProps {
  pokemon: PokemonSpecies['pokemon'][number];
  species: PokemonSpecies;
  onPokemonSwitch: (pokemonId: number) => void;
}

const PokemonHeader: React.FC<PokemonHeaderProps> = ({ pokemon, species, onPokemonSwitch }) => {
  const breakpointWidth = useBreakpointWidth();
  const speciesName = species.names[0]?.name || pokemon.name;
  const evolutionChain = species.evolutionChain;

  return (
    <div className="">
      {/* Sprites Section */}
      <SectionCard colorVariant="article" className="grid grid-cols-1 gap-4">
        <div className="flex flex-col ">
          <PokemonArtwork pokemon={pokemon} />
        </div>

        <div className="w-full flex justify-center items-center">
          <PokemonFormSwitcher
            speciesPokemon={species.pokemon}
            speciesName={speciesName}
            activePokemon={pokemon}
            onPokemonSwitch={onPokemonSwitch}
          />
        </div>

        {/* Pokemon Info */}
        <PokemonInfo pokemon={pokemon} species={species} />

        <SectionCard variant="compact">
          {/* Flavor Text */}
          <PokemonFlavorText flavorTexts={species.flavorTexts} />
        </SectionCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PokemonBaseStats stats={pokemon.stats} />
          {/* Abilities Section */}
          <SectionCard title="Abilities" variant="compact">
            <PokemonAbilities pokemon={pokemon} />
          </SectionCard>
        </div>
        <PokemonStatTable stats={pokemon.stats} />
        {/* Evolution Chain - Responsive Rendering */}
        {evolutionChain?.pokemonSpecies.length &&
          (breakpointWidth < 640 ? (
            <SectionCard title="Evolution Chain" variant="compact">
              {/* Mobile Evolution Chain - Visible on smaller screens, hidden on lg+ */}
              <MobileEvolutionChain species={species} />
            </SectionCard>
          ) : (
            <div>
              {/* Desktop Evolution Chain - Hidden on smaller screens, visible on lg+ */}
              <SectionCard title="Evolution Chain" variant="compact">
                <EvolutionChain chain={evolutionChain} />
              </SectionCard>
            </div>
          ))}
      </SectionCard>
    </div>
  );
};

export default PokemonHeader;
