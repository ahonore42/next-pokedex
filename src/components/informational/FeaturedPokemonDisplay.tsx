import { FeaturedPokemon } from "@/lib/types/pokemon";
import { getTypeColor, capitalizeName } from "@/lib/api/pokemon";

export default function FeaturedPokemonDisplay({
  pokemon,
}: {
  pokemon: FeaturedPokemon[];
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Featured Pokémon
        </h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Daily Rotation
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pokemon.map((pkmn) => (
          <div
            key={pkmn.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <img
                src={pkmn.image}
                alt={pkmn.name}
                className="w-16 h-16 object-contain flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-600">
                    #{pkmn.id.toString().padStart(3, "0")}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {capitalizeName(pkmn.name)}
                  </span>
                </div>
                <div className="flex gap-1 mb-2">
                  {pkmn.types.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-0.5 text-xs rounded text-white font-medium"
                      style={{ backgroundColor: getTypeColor(type) }}
                    >
                      {type.toUpperCase()}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {pkmn.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
