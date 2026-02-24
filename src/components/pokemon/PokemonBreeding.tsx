import type { PokemonSpecies } from '~/server/routers/_app';
import SectionCard from '../ui/SectionCard';
import InfoField from '../ui/InfoField';

interface PokemonBreedingProps {
  eggGroups: PokemonSpecies['eggGroups'];

  hatchCounter: PokemonSpecies['hatchCounter'];
  className?: string;
}

export default function PokemonBreeding({
  eggGroups,

  hatchCounter,
  className,
}: PokemonBreedingProps) {
  const eggGroupInfo = (
    <span className="flex flex-nowrap gap-2">
      {eggGroups.map((eggGroupEntry) => (
        <span
          key={eggGroupEntry.eggGroup.id}
          className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm whitespace-nowrap capitalize"
        >
          {eggGroupEntry.eggGroup.names[0]?.name || eggGroupEntry.eggGroup.name}
        </span>
      ))}
    </span>
  );

  return (
    <SectionCard variant="compact" className={className}>
      <div className="flex flex-wrap justify-between gap-2">
        {/* Egg Groups */}
        <InfoField header="Egg Groups" primary={eggGroupInfo} />

        {/* Hatch Counter */}
        <InfoField
          header="Hatch Time"
          primary={<span className="whitespace-nowrap font-normal">{hatchCounter} cycles</span>}
          secondary={<span className="whitespace-nowrap"> ({hatchCounter * 256} steps)</span>}
        />
      </div>
    </SectionCard>
  );
}
