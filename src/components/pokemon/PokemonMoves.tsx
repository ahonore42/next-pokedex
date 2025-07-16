import type { PokemonInSpecies } from '~/server/routers/_app';
import MoveTable from './MoveTable';

interface ComponentProps {
  pokemon: PokemonInSpecies;
}

// Pokemon Moves Component
export const PokemonMoves: React.FC<ComponentProps> = ({ pokemon }) => {
  // Group moves by learn method
  const movesByMethod = pokemon.moves.reduce(
    (acc, pokemonMove) => {
      const method = pokemonMove.moveLearnMethod.name;
      if (!acc[method]) {
        acc[method] = [];
      }
      acc[method].push(pokemonMove);
      return acc;
    },
    {} as Record<string, typeof pokemon.moves>,
  );

  // Define the order of learn methods for display
  const methodOrder = [
    'level-up',
    'machine', // TMs/TRs
    'egg',
    'tutor',
    'transfer',
    'light-ball-egg',
    'colosseum-purification',
    'xd-shadow',
    'xd-purification',
    'form-change',
    'zygarde-cube',
  ];

  // Get learn method display name
  const getMethodDisplayName = (method: string, moves: typeof pokemon.moves) => {
    const methodData = moves[0]?.moveLearnMethod;
    const displayName = methodData?.names[0]?.name || method;
    // Add specific handling for common methods
    switch (method) {
      case 'level-up':
        return 'Level Up';
      case 'machine':
        return 'TM/HM';
      case 'egg':
        return 'Egg Moves';
      case 'tutor':
        return 'Move Tutor';
      case 'transfer':
        return 'Transfer Only';
      default:
        return displayName.replaceAll('-', ' ');
    }
  };

  // Sort methods by predefined order, then alphabetically
  const sortedMethods = Object.keys(movesByMethod).sort((a, b) => {
    const aIndex = methodOrder.indexOf(a);
    const bIndex = methodOrder.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    } else if (aIndex !== -1) {
      return -1;
    } else if (bIndex !== -1) {
      return 1;
    } else {
      return a.localeCompare(b);
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Moves</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Moves</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {pokemon.moves.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Learn Methods</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {Object.keys(movesByMethod).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Level-Up Moves</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {movesByMethod['level-up']?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">TM Moves</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {movesByMethod.machine?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Render MoveTable for each learn method */}
      {sortedMethods.map((method) => (
        <MoveTable
          key={method}
          moves={pokemon.moves}
          learnMethod={method}
          learnMethodName={getMethodDisplayName(method, movesByMethod[method])}
        />
      ))}
    </div>
  );
};
