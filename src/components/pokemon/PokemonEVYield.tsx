import { PokemonInSpecies, PokemonStats } from '~/server/routers/_app';
import { getStatName } from '~/utils';
import SectionCard from '../ui/SectionCard';

interface PokemonEVYieldProps {
  stats: PokemonStats;
  baseExperience: PokemonInSpecies['baseExperience'];
  className?: string;
}

export default function PokemonEVYield({ stats, baseExperience, className }: PokemonEVYieldProps) {
  const totalEffort = stats.reduce((total, stat) => total + stat.effort, 0);
  if (totalEffort === 0) return null;
  const effortValues = stats
    .filter((stat) => stat.effort > 0)
    .map((stat) => `+${stat.effort} ${getStatName(stat.stat.name)}`);

  return (
    <SectionCard title="EV Yield" variant="compact" tags={effortValues} className={className}>
      <p className="text-md text-muted">
        Defeating this Pokémon yields
        <span className="font-semibold text-primary">
          {` ${totalEffort} Effort Value${totalEffort !== 1 ? 's.' : '.'}`}
        </span>
      </p>

      {/* Base Experience */}
      {baseExperience && (
        <p className="text-sm text-muted">
          Base Experience: <span className="font-semibold text-primary">{baseExperience}</span>
        </p>
      )}
    </SectionCard>
  );
}
