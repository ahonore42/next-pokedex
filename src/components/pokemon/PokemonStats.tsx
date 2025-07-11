import { PokemonDetailedById } from '~/server/routers/_app';
import { orderStatsWithSpeedLast } from '~/utils/pokemon';

interface PokemonStatsProps {
  pokemon: PokemonDetailedById;
}

const PokemonStats: React.FC<PokemonStatsProps> = ({ pokemon }) => {
  const orderedStats = orderStatsWithSpeedLast(pokemon.stats);
  // Calculate total stats
  const totalBaseStat = pokemon.stats.reduce((total, stat) => total + stat.baseStat, 0);
  const totalEffort = pokemon.stats.reduce((total, stat) => total + stat.effort, 0);

  // Get stat color based on value
  const getStatColor = (baseStat: number) => {
    if (baseStat >= 120) return 'bg-green-500';
    if (baseStat >= 100) return 'bg-lime-500';
    if (baseStat >= 80) return 'bg-yellow-500';
    if (baseStat >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get stat abbreviation for mobile
  const getStatAbbr = (statName: string) => {
    const abbrs: Record<string, string> = {
      hp: 'HP',
      attack: 'ATK',
      defense: 'DEF',
      'special-attack': 'SP.ATK',
      'special-defense': 'SP.DEF',
      speed: 'SPD',
    };
    return abbrs[statName] || statName.toUpperCase();
  };

  // Get full stat name
  const getStatName = (stat: PokemonDetailedById['stats'][0]) => {
    return stat.stat.names[0]?.name || stat.stat.name;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Base Stats</h2>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Total: {totalBaseStat}</span>
          {totalEffort > 0 && <span className="ml-4">EV Yield: {totalEffort}</span>}
        </div>
      </div>

      <div className="space-y-4">
        {orderedStats.map((pokemonStat) => {
          const statName = getStatName(pokemonStat);
          const statAbbr = getStatAbbr(pokemonStat.stat.name);
          const percentage = (pokemonStat.baseStat / 180) * 100; // 180 is roughly max base stat

          return (
            <div key={pokemonStat.stat.id} className="grid grid-cols-12 gap-4 items-center">
              {/* Stat Name */}
              <div className="col-span-2 lg:col-span-3">
                <span className="hidden md:inline font-medium text-gray-700 dark:text-gray-300 text-nowrap">
                  {statName}
                </span>
                <span className="md:hidden font-medium text-gray-700 dark:text-gray-300">
                  {statAbbr}
                </span>
              </div>

              {/* Base Stat Value */}
              <div className="col-span-2 sm:col-span-1 text-right">
                <span className="font-bold text-gray-900 dark:text-white">
                  {pokemonStat.baseStat}
                </span>
              </div>

              {/* Stat Bar */}
              <div className="col-span-6 sm:col-span-7">
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-6">
                    <div
                      className={`h-6 rounded-full transition-all duration-300 ${getStatColor(pokemonStat.baseStat)}`}
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
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
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
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{totalBaseStat}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {Math.round(totalBaseStat / pokemon.stats.length)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Highest</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {Math.max(...pokemon.stats.map((s) => s.baseStat))}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Lowest</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {Math.min(...pokemon.stats.map((s) => s.baseStat))}
            </p>
          </div>
        </div>
      </div>

      {/* EV Yield Information */}
      {totalEffort > 0 && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            EV Yield Information
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Defeating this Pokémon yields {totalEffort} Effort Value{totalEffort !== 1 ? 's' : ''}{' '}
            total:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {pokemon.stats
              .filter((stat) => stat.effort > 0)
              .map((stat) => (
                <span
                  key={stat.stat.id}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs font-medium"
                >
                  +{stat.effort} {getStatAbbr(stat.stat.name)}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Base Experience */}
      {pokemon.baseExperience && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Base Experience:{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {pokemon.baseExperience}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PokemonStats;
