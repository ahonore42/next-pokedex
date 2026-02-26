import React from 'react';

interface EvolutionSpecies {
  id: number;
  name: string;
  evolvesFromSpecies?: {
    id: number;
  } | null;
  varieties: {
    pokemon: {
      sprites?: {
        frontDefault?: string | null;
      } | null;
    };
  }[];
}

interface EvolutionChain {
  pokemonSpecies: EvolutionSpecies[];
}

interface MobileEvolutionChainProps {
  chain: EvolutionChain | null | undefined;
  className?: string;
}

const MobileEvolutionChain: React.FC<MobileEvolutionChainProps> = ({ chain }) => {
  // Don't render if there's no evolution chain
  if (!chain?.pokemonSpecies.length) {
    return null;
  }

  const organizeEvolutionChain = () => {
    const allSpecies = chain.pokemonSpecies;

    // Group by what they evolve from
    const evolutionGroups = new Map<number | null, EvolutionSpecies[]>();

    allSpecies.forEach((pokemon) => {
      const evolvesFromId = pokemon.evolvesFromSpecies?.id || null;
      if (!evolutionGroups.has(evolvesFromId)) {
        evolutionGroups.set(evolvesFromId, []);
      }
      evolutionGroups.get(evolvesFromId)!.push(pokemon);
    });

    // Check if any species has multiple evolutions
    const hasMultipleEvolutions = Array.from(evolutionGroups.values()).some(
      (group) => group.length > 1,
    );

    if (!hasMultipleEvolutions) {
      // Linear evolution - show all in one row
      return { type: 'linear', groups: [allSpecies] };
    } else {
      // Branching evolution - separate into stages
      const stages: EvolutionSpecies[][] = [];

      // Start with base Pokemon (no evolves from)
      const basePokemon = evolutionGroups.get(null) || [];
      if (basePokemon.length > 0) {
        stages.push(basePokemon);
      }

      // Add evolution groups
      evolutionGroups.forEach((group, evolvesFromId) => {
        if (evolvesFromId !== null) {
          stages.push(group);
        }
      });

      return { type: 'branching', groups: stages };
    }
  };

  const { type, groups } = organizeEvolutionChain();

  const renderPokemonCard = (evoSpecies: EvolutionSpecies) => (
    <div key={evoSpecies.id}>
      <div className="w-24 h-24 mx-auto mb-2">
        {evoSpecies.varieties[0] && (
          <img
            src={evoSpecies.varieties[0].pokemon.sprites?.frontDefault || ''}
            alt={evoSpecies.name}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        )}
        <div className="flex justify-center items-center gap-1">
          <p className="text-xs text-gray-600">#{evoSpecies.id}</p>
          <p className="font-semibold capitalize text-sm">{evoSpecies.name}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {type === 'linear' ? (
        // Linear evolution - single row
        <div className="flex flex-wrap items-center justify-around md:justify-center gap-6">
          {groups[0].map(renderPokemonCard)}
        </div>
      ) : (
        // Branching evolution - multiple rows with arrows
        <div className="space-y-6">
          {groups.map((group, index) => (
            <div key={index}>
              <div className="flex flex-wrap items-center justify-center gap-6">
                {group.map(renderPokemonCard)}
              </div>
              {/* Add arrow between stages (except after last stage) */}
              {index < groups.length - 1 && (
                <div className="flex justify-center my-4">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MobileEvolutionChain;
