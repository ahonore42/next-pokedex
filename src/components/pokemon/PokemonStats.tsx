import { PokemonInSpecies } from '~/server/routers/_app';
import {
  orderStatsWithSpeedLast,
  getStatColor,
  getStatAbbr,
  getStatName,
  getCompetitiveStatRanges,
  convertStatsArrayToValues,
} from '~/utils/pokemon';
import PokemonStatTable from './PokemonStatTable';
import SectionCard from '../ui/SectionCard';

interface PokemonStatsProps {
  stats: PokemonInSpecies['stats'];
  baseExperience: PokemonInSpecies['baseExperience'];
}

const PokemonStats: React.FC<PokemonStatsProps> = ({ stats, baseExperience }) => {
  const orderedStats = orderStatsWithSpeedLast(stats);
  const baseStats = convertStatsArrayToValues(stats);
  const statRanges = getCompetitiveStatRanges(baseStats);
  const totalBaseStat = stats.reduce((total, stat) => total + stat.baseStat, 0);
  const totalEffort = stats.reduce((total, stat) => total + stat.effort, 0);
  return (
    <div className="bg-surface rounded-lg shadow-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">Base Stats</h2>
        <div className="text-sm text-muted">
          <span className="font-medium">Total: {totalBaseStat}</span>
          {totalEffort > 0 && <span className="ml-4">EV Yield: {totalEffort}</span>}
        </div>
      </div>

      <div className="space-y-4">
        {orderedStats.map((pokemonStat) => {
          const statName = getStatName(pokemonStat);
          const statAbbr = getStatAbbr(pokemonStat.stat.name);
          const percentage = (pokemonStat.baseStat / 200) * 100; // 200 is roughly max base stat
          const statColor = getStatColor(pokemonStat.baseStat, 'bg');
          console.log('stat color:', statColor);
          return (
            <div key={pokemonStat.stat.id} className="grid grid-cols-12 gap-4 items-center">
              {/* Stat Name */}
              <div className="col-span-2 lg:col-span-3">
                <span className="hidden md:inline font-medium text-muted text-nowrap">
                  {statName}
                </span>
                <span className="md:hidden font-medium text-muted">{statAbbr}</span>
              </div>

              {/* Base Stat Value */}
              <div className="col-span-2 sm:col-span-1 text-right">
                <span className="font-bold text-primary">{pokemonStat.baseStat}</span>
              </div>

              {/* Stat Bar */}
              <div className="col-span-6 sm:col-span-7">
                <div className="relative">
                  <div className="w-full bg-tertiary rounded-full h-6">
                    <div
                      className={`h-6 rounded-full transition-all duration-300 ${statColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {pokemonStat.baseStat}
                    </span>
                  </div>
                </div>
              </div>

              {/* EV Yield */}
              <div className="col-span-1">
                {pokemonStat.effort > 0 && (
                  <div className="flex items-center justify-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-info-bg text-info rounded-full text-xs font-medium">
                      {pokemonStat.effort}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-subtle">Total</p>
            <p className="text-xl font-bold text-primary">{totalBaseStat}</p>
          </div>
          <div>
            <p className="text-sm text-subtle">Average</p>
            <p className="text-xl font-bold text-primary">
              {Math.round(totalBaseStat / stats.length)}
            </p>
          </div>
          <div>
            <p className="text-sm text-subtle">Highest</p>
            <p className="text-xl font-bold text-primary">
              {Math.max(...stats.map((s) => s.baseStat))}
            </p>
          </div>
          <div>
            <p className="text-sm text-subtle">Lowest</p>
            <p className="text-xl font-bold text-primary">
              {Math.min(...stats.map((s) => s.baseStat))}
            </p>
          </div>
        </div>
      </div>

      {/* EV Yield Information */}
      {totalEffort > 0 && (
        <SectionCard title="EV Yield" variant="compact" className="mt-4 bg-info-bg border-info">
          <p className="text-sm text-info">
            Defeating this Pokémon yields {totalEffort} Effort Value{totalEffort !== 1 ? 's' : ''}{' '}
            total:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {stats
              .filter((stat) => stat.effort > 0)
              .map((stat) => (
                <span
                  key={stat.stat.id}
                  className="inline-flex items-center px-2 py-1 bg-info text-white rounded text-xs font-medium"
                >
                  +{stat.effort} {getStatAbbr(stat.stat.name)}
                </span>
              ))}
          </div>

          {/* Base Experience */}
          {baseExperience && (
            <div className="mt-4 text-center">
              <p className="text-sm text-subtle">
                Base Experience: <span className="font-medium text-primary">{baseExperience}</span>
              </p>
            </div>
          )}
        </SectionCard>
      )}

      <div className="mt-8">
        <PokemonStatTable competitiveRanges={statRanges} baseStats={baseStats} />
      </div>
    </div>
  );
};

export default PokemonStats;
