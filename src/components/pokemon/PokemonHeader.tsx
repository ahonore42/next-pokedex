import EvolutionChain from './EvolutionChain';
import PokemonArtwork from './PokemonArtwork';
import { PokemonInSpecies, PokemonSpeciesByIdOutput } from '~/server/routers/_app';
import SectionCard from '../ui/SectionCard';
import { PokemonAbilities } from './PokemonAbilities';
import MobileEvolutionChain from './MobileEvolutionChain';
import PokemonFlavorText from './PokemonFlavorText';
import PokemonFormSwitcher from './PokemonFormSwitcher';
import { PokemonBreeding } from './PokemonBreeding';
import TypeBadgesDisplay from '../pokemon-types/TypeBadgesDisplay';

interface PokemonHeaderProps {
  pokemon: PokemonInSpecies;
  species: PokemonSpeciesByIdOutput;
  onPokemonSwitch: (pokemonId: number) => void;
}

const PokemonHeader: React.FC<PokemonHeaderProps> = ({ pokemon, species, onPokemonSwitch }) => {
  const speciesName = species.names[0]?.name || pokemon.name;
  const evolutionChain = species.evolutionChain;

  // Physical characteristics
  const heightInMeters = pokemon.height / 10;
  const weightInKg = pokemon.weight / 10;
  const heightInFeet = Math.floor(heightInMeters * 3.28084);
  const heightInInches = Math.round((heightInMeters * 39.3701) % 12);
  const weightInLbs = Math.round(weightInKg * 2.20462);

  return (
    <div className="space-y-8">
      {/* Sprites Section */}
      <div className="bg-surface text-primary rounded-lg shadow-lg p-6 border border-border">
        <div className="flex flex-col space-y-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pokemon Info */}
          <div className="space-y-6">
            {/* Physical Characteristics */}
            <div className="grid grid-cols-3 gap-4">
              <SectionCard title="Type" variant="compact">
                <TypeBadgesDisplay
                  types={pokemon.types}
                  className="w-full flex justify-center items-center"
                />
              </SectionCard>

              <SectionCard title="Height" variant="compact">
                <p className="text-lg text-primary font-medium">{heightInMeters.toFixed(1)} m</p>
                <p className="text-sm text-muted">
                  {heightInFeet}'{heightInInches}"
                </p>
              </SectionCard>

              <SectionCard title="Weight" variant="compact">
                <p className="text-lg text-primary font-medium">{weightInKg.toFixed(1)} kg</p>
                <p className="text-sm text-muted">{weightInLbs} lbs</p>
              </SectionCard>
            </div>

            <SectionCard title="Breeding" variant="compact">
              <PokemonBreeding
                eggGroups={species.eggGroups}
                genderRate={species.genderRate}
                hatchCounter={species.hatchCounter}
              />
            </SectionCard>

            {/* Flavor Text */}
            <SectionCard title="Pokédex Entry" variant="compact">
              <PokemonFlavorText species={species} />
            </SectionCard>
          </div>

          {/* Abilities Section */}
          <SectionCard title="Abilities" variant="compact">
            <PokemonAbilities pokemon={pokemon} />
          </SectionCard>
        </div>

        {/* Evolution Chain - Responsive Rendering */}
        {evolutionChain && (
          <>
            {/* Desktop Evolution Chain - Hidden on smaller screens, visible on lg+ */}
            <div className="hidden lg:block mt-8">
              <SectionCard title="Evolution Chain" variant="compact">
                <EvolutionChain chain={evolutionChain} />
              </SectionCard>
            </div>

            {/* Mobile Evolution Chain - Visible on smaller screens, hidden on lg+ */}
            <SectionCard title="Evolution Chain" variant="compact" className="mt-8 lg:hidden">
              <MobileEvolutionChain species={species} />
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
};

export default PokemonHeader;
