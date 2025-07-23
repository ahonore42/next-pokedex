import { useEffect, useState } from 'react';
import { NextPageWithLayout } from './_app';
import { trpc } from '~/utils/trpc';
import { PokemonArtworkByNames, PokemonListOutput } from '~/server/routers/_app';
import QuickAccess from '~/components/layout/QuickAccess';
import SearchBar from '~/components/layout/SearchBar';
import LatestUpdates from '~/components/informational/LatestUpdates';
import FeaturedPokemonDisplay from '~/components/informational/FeaturedPokemonDisplay';
import PageHeading from '~/components/layout/PageHeading';

const IndexPage: NextPageWithLayout = () => {
  const [pokemon, setPokemon] = useState<PokemonListOutput['pokemon']>([]);
  const [legendaries, setLegendaries] = useState<PokemonArtworkByNames>([]);
  const utils = trpc.useUtils();
  const pokemonQuery = trpc.pokemon.featured.useQuery();
  const artworkQuery = trpc.pokemon.officialArtworkByNames.useQuery({
    names: ['dialga', 'palkia'],
  });

  useEffect(() => {
    // Only update state when data is available
    if (pokemonQuery.data && artworkQuery.data) {
      const pokemonList = pokemonQuery.data.pokemon ?? [];
      const legendarySprites = artworkQuery.data;
      setPokemon(pokemonList);
      setLegendaries(legendarySprites);
    }
  }, [pokemonQuery.data, artworkQuery.data, utils]);

  // Calculate loading state based on query states and data availability
  const isPageLoading =
    pokemonQuery.isLoading || artworkQuery.isLoading || !pokemonQuery.data || !artworkQuery.data;
  if (isPageLoading) {
    return null; // Let DefaultLayout handle the loading display
  }

  return (
    <>
      <PageHeading
        pageTitle="Evolve Pokédex - Comprehensive Pokémon Game Database"
        metaDescription="Comprehensive and accurate online resource for Pokémon game information across every generation and region."
        useCanonical={true}
        ogImage="/evolve-pokedex-homepage.png"
        ogType="website"
        schemaType="WebSite"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Evolve Pokédex',
          description:
            'Comprehensive and accurate online resource for Pokémon game information across every generation and region',
          url: process.env.NEXT_PUBLIC_BASE_URL,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': process.env.NEXT_PUBLIC_BASE_URL,
          },
          publisher: {
            '@type': 'Organization',
            name: 'Evolve Pokédex',
          },
        }}
        breadcrumbLinks={[]}
        currentPage="Home"
      />
      {/* Title outside overlay area */}
      <h1 className="text-3xl md:text-4xl xl:text-5xl 2xl:text-6xl font-bold tracking-tight xl:tracking-tighter 2xl:mb-4 indigo-gradient text-left">
        Evolve Pokédex
      </h1>
      {/* Mobile-only layout - simple stacked */}
      <div className="block md:hidden">
        <div className="px-4 py-6 space-y-6">
          <div className="max-w-sm mx-auto">
            <p className="text-lg text-muted text-left">
              Comprehensive and accurate online resource for Pokémon game information across every
              generation and region.
            </p>
          </div>
          <div className="max-w-sm mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Desktop-only layout - with overlay */}
      <div className="hidden md:block">
        <div className="relative flex items-center justify-center h-48 lg:h-72 xl:h-96 2xl:mt-8">
          {/* Background images layer */}
          {legendaries[0] && legendaries[1] && (
            <div className="absolute inset-0 flex justify-between items-center w-full">
              <img
                src={legendaries[0]}
                className="object-contain size-48 lg:size-72 xl:size-96 2xl:size-112 opacity-90 hover:opacity-100 transition-interactive"
              />
              <img
                src={legendaries[1]}
                className="object-contain size-48 lg:size-72 xl:size-96 2xl:size-112 opacity-90 hover:opacity-100 transition-interactive"
              />
            </div>
          )}

          {/* Foreground content */}
          <div className="relative z-10 ">
            <div className="max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto px-4 sm:px-0">
              <p className="text-xl xl:text-2xl text-muted mx-auto text-left backdrop-blur-lg rounded-lg">
                Comprehensive and accurate online resource for Pokémon game information across every
                generation and region.
              </p>
            </div>
            <div className="mt-4 max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto h-16">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col col-span-1 gap-4">
        <QuickAccess />
        <FeaturedPokemonDisplay pokemon={pokemon} />
        <LatestUpdates />
      </div>
    </>
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
