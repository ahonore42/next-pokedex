import { AppStats } from "@/lib/types/pokemon";

export default function DatabaseStats({ stats }: { stats: AppStats }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Database Statistics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalPokemon.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Pokémon Species</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.totalTypes}
          </div>
          <div className="text-sm text-gray-600">Types</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalGenerations}
          </div>
          <div className="text-sm text-gray-600">Generations</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats.totalMoves}
          </div>
          <div className="text-sm text-gray-600">Moves</div>
        </div>
      </div>
    </div>
  );
}
