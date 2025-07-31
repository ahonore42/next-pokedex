import { useEffect, useState } from 'react';
import { NextPageWithLayout } from './_app';
import { trpc } from '~/utils/trpc';
import { useBreakpointWidth } from '~/hooks';
import { PokemonArtworkByNames, FeaturedPokemonOutput } from '~/server/routers/_app';
import PageHeading from '~/components/layout/PageHeading';
import PageContent from '~/components/layout/PageContent';
import ArtworkImage from '~/components/ui/ArtworkImage';
import SearchBar from '~/components/layout/SearchBar';
import QuickAccess from '~/components/layout/QuickAccess';
import FeaturedPokemonDisplay from '~/components/informational/FeaturedPokemonDisplay';
import LatestUpdates from '~/components/informational/LatestUpdates';

const IndexPage: NextPageWithLayout = () => {
  const breakpointWidth = useBreakpointWidth();
  const [pokemon, setPokemon] = useState<FeaturedPokemonOutput>([]);
  const [legendaries, setLegendaries] = useState<PokemonArtworkByNames>([]);
  const utils = trpc.useUtils();
  const pokemonQuery = trpc.pokemon.featured.useQuery();
  const artworkQuery = trpc.pokemon.officialArtworkByNames.useQuery({
    names: ['dialga', 'palkia'],
  });

  useEffect(() => {
    // Only update state when data is available
    if (pokemonQuery.data && artworkQuery.data) {
      const pokemonList = pokemonQuery.data ?? [];
      const legendarySprites = artworkQuery.data;
      setPokemon(pokemonList);
      setLegendaries(legendarySprites);
    }
  }, [pokemonQuery.data, artworkQuery.data, utils]);

  // Calculate loading state based on query states and data availability
  const isPageLoading =
    pokemonQuery.isLoading || artworkQuery.isLoading || !pokemon.length || !legendaries.length;
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
      <PageContent>
        {/* Title outside overlay area */}
        <h1 className="text-3xl md:text-4xl xl:text-5xl 2xl:text-6xl font-bold tracking-tight xl:tracking-tighter indigo-gradient text-left">
          Evolve Pokédex
        </h1>

        {/* Mobile-only layout - simple stacked */}
        {breakpointWidth < 768 ? (
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
        ) : (
          <div className="relative flex items-center justify-center h-48 lg:h-72 xl:h-96 2xl:h-112">
            {/* Background images layer */}
            {legendaries[0] && legendaries[1] && (
              <div className="absolute inset-0 flex justify-between items-center w-full">
                <ArtworkImage
                  src={legendaries[0]}
                  alt="Official Dialga Artwork"
                  size="size-48 lg:size-72 xl:size-96 2xl:size-112"
                />
                <ArtworkImage
                  src={legendaries[1]}
                  alt="Official Palkia Artwork"
                  size="size-48 lg:size-72 xl:size-96 2xl:size-112"
                />
              </div>
            )}

            {/* Foreground content */}
            <div className="relative z-10 ">
              <div className="max-w-sm sm:max-w-md md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto px-4 sm:px-0">
                <p className="text-xl xl:text-2xl text-muted mx-auto text-left backdrop-blur-lg rounded-lg">
                  Comprehensive and accurate online resource for Pokémon game information across
                  every generation and region.
                </p>
              </div>
              <div className="mt-4 max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto h-16">
                <SearchBar />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <QuickAccess />
        <FeaturedPokemonDisplay pokemon={pokemon} />
        <LatestUpdates />
      </PageContent>
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
