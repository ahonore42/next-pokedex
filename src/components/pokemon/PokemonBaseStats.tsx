import React from 'react';
import { PokemonStats } from '~/server/routers/_app';
import { getStatName } from '~/utils/pokemon';
import SectionCard from '../ui/SectionCard';
import MetricsGrid from '../ui/MetricsGrid';
import BarChart from '../ui/charts';

interface PokemonBaseStatsProps {
  stats: PokemonStats;
}

const PokemonBaseStats: React.FC<PokemonBaseStatsProps> = React.memo(({ stats }) => {
  const totalBaseStat = stats.reduce((t, s) => t + s.baseStat, 0);
  const averageBaseStat = Math.round(totalBaseStat / stats.length);
  const highestBaseStat = Math.max(...stats.map((s) => s.baseStat));
  const lowestBaseStat = Math.min(...stats.map((s) => s.baseStat));
  const chartData = stats.map((pokemonStat) => ({
    id: pokemonStat.stat.id,
    value: pokemonStat.baseStat,
    textColumns: [
      { value: getStatName(pokemonStat.stat.name), className: 'font-semibold text-nowrap' },
      { value: pokemonStat.baseStat, className: 'text-right font-bold text-primary' },
    ],
  }));

  return (
    <SectionCard title="Base Stats" variant="compact" tags={[`Total: ${totalBaseStat}`]}>
      {/* Colored Stat Bars */}
      <BarChart data={chartData} maxValue={200} animate />

      {/* Stats Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <MetricsGrid
          metrics={[
            { label: 'Total', value: totalBaseStat },
            { label: 'Average', value: averageBaseStat },
            { label: 'Highest', value: highestBaseStat },
            { label: 'Lowest', value: lowestBaseStat },
          ]}
          columns={{ default: 2, sm: 4 }}
        />
      </div>
    </SectionCard>
  );
});

export default PokemonBaseStats;
