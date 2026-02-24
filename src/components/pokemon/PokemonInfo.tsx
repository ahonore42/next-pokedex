import { PokemonSpecies } from '~/server/routers/_app';
import SectionCard from '../ui/SectionCard';
import PokemonBreeding from './PokemonBreeding';
import TypeBadgesDisplay from '../pokemon-types/TypeBadgesDisplay';
import PokemonCries from './PokemonCries';
import PokemonEVYield from './PokemonEVYield';
import InfoField from '../ui/InfoField';
import PokemonGenderRate from './PokemonGenderRate';

interface PokemonInfoProps {
  pokemon: PokemonSpecies['pokemon'][number];
  species: PokemonSpecies;
}

const PokemonInfo: React.FC<PokemonInfoProps> = ({ pokemon, species }) => {
  const captureRatePercentage = `${((species.captureRate / 255) * 100).toFixed(1)}%`;
  // Physical characteristics
  const heightInMeters = pokemon.height / 10;
  const weightInKg = pokemon.weight / 10;
  const heightInFeet = Math.floor(heightInMeters * 3.28084);
  const heightInInches = Math.round((heightInMeters * 39.3701) % 12);
  const weightInLbs = Math.round(weightInKg * 2.20462);
  const types = pokemon.types.map((type) => type.type.name);
  return (
    <div className="">
      {/* Sprites Section */}

      {/* Pokemon Info */}
      <div className="flex-auto grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="flex flex-wrap gap-4">
          <SectionCard title="Type" variant="compact" className="flex-auto">
            <div className="flex items-center justify-center">
              <TypeBadgesDisplay types={types} link={true} />
            </div>
          </SectionCard>

          <PokemonCries
            criesLatest={pokemon.criesLatest}
            criesLegacy={pokemon.criesLegacy}
            className="flex-auto"
          />

          <div className="flex-auto flex flex-wrap gap-4">
            <PokemonBreeding
              eggGroups={species.eggGroups}
              hatchCounter={species.hatchCounter}
              className="flex-auto"
            />
            <PokemonGenderRate genderRate={species.genderRate} className="flex-auto" />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <PokemonEVYield
            stats={pokemon.stats}
            baseExperience={pokemon.baseExperience}
            className="flex-auto"
          />

          <div className="flex flex-auto flex-wrap gap-4">
            <SectionCard title="Height" variant="compact" className="flex-auto">
              <InfoField
                primary={`${heightInMeters.toFixed(1)} m`}
                secondary={`${heightInFeet}'${heightInInches}"`}
              />
            </SectionCard>

            <SectionCard title="Weight" variant="compact" className="flex-auto">
              <InfoField primary={`${weightInKg.toFixed(1)} kg`} secondary={`${weightInLbs} lbs`} />
            </SectionCard>
            <SectionCard title="Catch Rate" variant="compact" className="flex-auto">
              <InfoField primary={species.captureRate} secondary={captureRatePercentage} />
            </SectionCard>

            <SectionCard title="Base Happiness" variant="compact" className="flex-auto text-wrap">
              <InfoField primary={species.baseHappiness} />
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonInfo;
