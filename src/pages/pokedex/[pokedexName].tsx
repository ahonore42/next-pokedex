import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { usePageLoading } from '~/lib/contexts/LoadingContext';
import { PokemonByPokedexOutput } from '~/server/routers/_app';
import SectionCard from '~/components/ui/SectionCard';
import TypeBadge from '~/components/pokemon-types/TypeBadge';
import InfiniteScroll from '~/components/ui/InfiniteScroll';

const PokedexDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { pokedexName } = router.query;
  const [selectedPokedex, setSelectedPokedex] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (pokedexName && typeof pokedexName === 'string') {
      setSelectedPokedex(pokedexName);
    }
  }, [pokedexName]);

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    trpc.pokemon.pokemonByPokedex.useInfiniteQuery(
      {
        pokedexName: typeof pokedexName === 'string' ? pokedexName : undefined,
        limit: 50,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!pokedexName, // Only enable query if pokedexName is available
      },
    );

  const { data: pokedexes, isLoading: isLoadingPokedexes } = trpc.pokemon.allPokedexes.useQuery();
  const { data: allTypes, isLoading: isLoadingTypes } = trpc.types.allTypes.useQuery();

  // Use the usePageLoading hook to manage loading state
  const isPageLoading = isLoading || isLoadingPokedexes || isLoadingTypes;
  usePageLoading(isPageLoading);

  const getType = (typeId: number) => {
    if (!allTypes) return undefined;
    return allTypes.find((t) => t.id === typeId);
  };

  const handlePokedexChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPokedexName = event.target.value;
    setSelectedPokedex(newPokedexName);
    if (newPokedexName) {
      router.push(`/pokedex/${newPokedexName}`);
    } else {
      router.push(`/pokedex`); // Navigate back to Pokedex selection
    }
  };

  const displayPokedexName =
    typeof pokedexName === 'string'
      ? pokedexName.charAt(0).toUpperCase() + pokedexName.slice(1)
      : 'Pokédex';

  // Early return for loading state - DefaultLayout will handle showing loading spinner
  if (isPageLoading) {
    return null;
  }

  return (
    <SectionCard title={`${displayPokedexName} Pokédex`}>
      <div className="mb-4 flex items-center space-x-4">
        <h2 className="text-xl font-bold">{displayPokedexName} Pokédex</h2>
        <select
          className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          onChange={handlePokedexChange}
          value={selectedPokedex || ''}
        >
          <option value="">Select a Pokédex</option>
          {pokedexes?.map((pokedex) => (
            <option key={pokedex.id} value={pokedex.name.toLowerCase()}>
              {pokedex.names[0].name || pokedex.name}
            </option>
          ))}
        </select>
      </div>

      <InfiniteScroll
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage ?? false}
        isLoading={isFetchingNextPage}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data?.pages.map((page) =>
            page.pokemon.map((pkmn: PokemonByPokedexOutput['pokemon'][number]) => (
              <Link
                key={pkmn.id}
                href={`/pokemon/${pkmn.id}`}
                className="p-4 border rounded-lg text-center hover:shadow-lg transition-shadow flex flex-col items-center"
              >
                <img src={pkmn.sprites?.frontDefault ?? ''} alt={pkmn.name} className="mx-auto" />
                <div className="flex justify-center align-center gap-2 mb-2">
                  <p className="text-gray-500 dark:text-gray-400">
                    #{(pkmn.pokemonSpecies as any).pokedexNumbers[0].pokedexNumber}{' '}
                  </p>
                  <p className="font-bold capitalize">{pkmn.name}</p>
                </div>
                <div className="flex justify-center gap-1 mb-2">
                  {pkmn.types.map((pokemonType) => {
                    const type = getType(pokemonType.typeId);
                    if (!type) return null;
                    return <TypeBadge key={pokemonType.slot} type={type} />;
                  })}
                </div>
              </Link>
            )),
          )}
        </div>
      </InfiniteScroll>
    </SectionCard>
  );
};

export default PokedexDetailPage;
