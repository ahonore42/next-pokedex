import SpriteLink from '../ui/SpriteLink';
import { useComponentHydration } from '~/hooks';
import InfiniteScroll from '../ui/InfiniteScroll';
import { usePagination } from '~/hooks';
import { PokemonListData } from '~/lib/types';
import { capitalizeName } from '~/utils/text';

interface PokedexDisplayProps {
  pokemon: PokemonListData[];
  itemsPerPage?: number;
}

export default function PokedexDisplay({ pokemon, itemsPerPage = 100 }: PokedexDisplayProps) {
  const {
    displayedData: displayedPokemon,
    hasMore,
    totalDisplayed,
    loadMore: handleLoadMore,
  } = usePagination({
    data: pokemon,
    itemsPerPage,
    resetDependency: pokemon.length, // Reset when pokedex changes
  });

  const { handleDataLoad, containerRef, loadProgress, totalData } = useComponentHydration(
    totalDisplayed,
    pokemon.length,
  );

  // Determine if we're loading new content
  const isLoadingNewContent = totalDisplayed !== totalData && loadProgress < 100;

  return (
    <InfiniteScroll
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoading={isLoadingNewContent}
      eagerLoad
    >
      <div
        ref={containerRef}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-9 gap-4"
      >
        {displayedPokemon.map((pokemon) => {
          const pokedexNumber = String(pokemon.speciesId);
          const pokemonName = capitalizeName(pokemon.name);

          const pokemonDefaultSprite = pokemon.sprites.frontDefault || pokemon.sprites.frontShiny;
          const types = pokemon.types;
          return (
            <SpriteLink
              key={pokemonName}
              href={`/pokemon/${pokemon.speciesId}`}
              src={pokemonDefaultSprite || ''}
              title={pokemonName}
              prefix={pokedexNumber}
              types={types}
              onImageLoad={handleDataLoad}
            />
          );
        })}
      </div>
    </InfiniteScroll>
  );
}
