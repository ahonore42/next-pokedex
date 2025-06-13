import { trpc } from '../utils/trpc';
import type { NextPageWithLayout } from './_app';
// import type { inferProcedureInput } from '@trpc/server';
// import Link from 'next/link';
// import type { AppRouter } from '~/server/routers/_app';
import { useEffect, useState } from 'react';
import { DbStats, PokemonArray } from '~/server/routers/_app';
import HeaderMenu from '~/components/layout/HeaderMenu';
import QuickAccess from '~/components/layout/QuickAccess';
import SearchBar from '~/components/layout/SearchBar';
import LatestUpdates from '~/components/informational/LatestUpdates';
import FooterMenu from '~/components/layout/FooterMenu';
import Pokeball from '~/components/ui/Pokeball';
import DatabaseStats from '~/components/informational/DatabaseStats';
import FeaturedPokemonDisplay from '~/components/informational/FeaturedPokemonDisplay';

const IndexPage: NextPageWithLayout = () => {
  const [pokemon, setPokemon] = useState<PokemonArray>([]);
  const [dbStats, setDbStats] = useState<DbStats | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const utils = trpc.useUtils();
  const pokemonQuery = trpc.pokemon.featured.useQuery();
  const statsQuery = trpc.pokemon.dbStats.useQuery();

  useEffect(() => {
    if (pokemon.length < 1) {
      setIsLoading(true);
    }
    const pokemonList = pokemonQuery.data?.pokemon ?? [];
    const stats = statsQuery.data;
    for (const { id } of pokemonList) {
      void utils.pokemon.byId.prefetch({ id });
    }
    setPokemon(pokemonList);
    setDbStats(stats);
    setIsLoading(false);
  }, [pokemonQuery.data, utils, pokemon.length, statsQuery.data]);

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <HeaderMenu />

      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Pokeball size="xl" endlessSpin spinSpeed={1.5} />
        </div>
      ) : (
        <main className="mb-4 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 md:py-12 xl:py-16 2xl:py-20 max-w-7xl 2xl:max-w-[1400px] self-center">
          {/* Welcome Section */}
          <div className="sm:flex sm:items-start sm:gap-4 sm:py-8 mb-4">
            <div className="px-4 sm:px-0">
              <h1 className="text-3xl md:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-primary tracking-tight xl:tracking-tighter mb-4 text-gradient">
                Evolve Pokédex
              </h1>
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto px-4">
                <p className="text-lg xl:text-xl 2xl:text-2xl text-secondary mx-auto text-left">
                  Your comprehensive resource for Pokémon information. Search
                  through our complete database of Pokémon species, moves,
                  abilities, and more.
                </p>
              </div>
            </div>
            {dbStats && <DatabaseStats stats={dbStats} />}
          </div>

          <div className="mb-4">
            <SearchBar />
          </div>

          {/* Main Content */}
          <div className="flex flex-col col-span-1 gap-4">
            <QuickAccess />
            <FeaturedPokemonDisplay pokemon={pokemon} />
            <LatestUpdates />
          </div>
        </main>
      )}

      <FooterMenu />
    </div>
  );
};

export default IndexPage;

/**
 * If you want to statically render this page
 * - Export `appRouter` & `createContext` from [trpc].ts
 * - Make the `opts` object optional on `createContext()`
 *
 * @see https://trpc.io/docs/v11/ssg
 */
// export const getStaticProps = async (
//   context: GetStaticPropsContext<{ filter: string }>,
// ) => {
//   const ssg = createServerSideHelpers({
//     router: appRouter,
//     ctx: await createContext(),
//   });
//
//   await ssg.post.all.fetch();
//
//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//       filter: context.params?.filter ?? 'all',
//     },
//     revalidate: 1,
//   };
// };
