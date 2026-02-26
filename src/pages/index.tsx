import { Suspense } from 'react';
import { NextPageWithLayout } from './_app';
import { trpc } from '~/utils/trpc';
import { useBreakpointWidth } from '~/hooks';
import PageHeading from '~/components/layout/PageHeading';
import PageContent from '~/components/layout/PageContent';
import ArtworkImage from '~/components/ui/ArtworkImage';
import QuickAccess from '~/components/layout/QuickAccess';
import FeaturedPokemonDisplay from '~/components/informational/FeaturedPokemonDisplay';
import LatestUpdates from '~/components/informational/LatestUpdates';
import SearchBar, { PokemonSearchResult, renderPokemonResult } from '~/components/ui/searchbars';
import SkeletonArtwork from '~/components/ui/skeletons/SkeletonArtwork';
import SkeletonInteractiveLink from '~/components/ui/skeletons/SkeletonInteractiveLink';
import SectionCard from '~/components/ui/SectionCard';

// ── Hero artwork (desktop only) ──────────────────────────────────────────────

function HeroArtwork() {
  const [legendaries] = trpc.pokemon.officialArtworkByNames.useSuspenseQuery(
    { names: ['dialga', 'palkia'] },
    { staleTime: Infinity },
  );

  return (
    <div className="absolute inset-0 flex justify-between items-center w-full">
      <ArtworkImage
        src={legendaries[0] ?? undefined}
        alt="Official Dialga Artwork"
        size="size-48 lg:size-72 xl:size-96 2xl:size-112"
      />
      <ArtworkImage
        src={legendaries[1] ?? undefined}
        alt="Official Palkia Artwork"
        size="size-48 lg:size-72 xl:size-96 2xl:size-112"
      />
    </div>
  );
}

function HeroArtworkSkeleton() {
  return (
    <div className="absolute inset-0 flex justify-between items-center w-full">
      <SkeletonArtwork size="size-48 lg:size-72 xl:size-96 2xl:size-112" />
      <SkeletonArtwork size="size-48 lg:size-72 xl:size-96 2xl:size-112" />
    </div>
  );
}

// ── Featured Pokémon ─────────────────────────────────────────────────────────

function FeaturedContent() {
  const [pokemon] = trpc.pokemon.featured.useSuspenseQuery(undefined, {
    staleTime: Infinity,
  });

  return <FeaturedPokemonDisplay pokemon={pokemon} />;
}

function FeaturedContentSkeleton() {
  return (
    <SectionCard title="Featured Pokémon" tags={['Daily Rotation']} colorVariant="transparent">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonInteractiveLink key={i} height="lg" />
        ))}
      </div>
    </SectionCard>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const IndexPage: NextPageWithLayout = () => {
  const breakpointWidth = useBreakpointWidth();

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
        <h1 className="text-3xl md:text-4xl xl:text-5xl 2xl:text-6xl font-bold tracking-tight xl:tracking-tighter indigo-gradient text-left">
          Evolve Pokédex
        </h1>

        {/* Mobile layout — no artwork */}
        {breakpointWidth < 768 ? (
          <div className="px-4 py-6 space-y-6">
            <div className="max-w-sm mx-auto">
              <p className="text-lg text-muted text-left">
                Comprehensive and accurate online resource for Pokémon game information across every
                generation and region.
              </p>
            </div>
            <div className="max-w-sm mx-auto">
              <SearchBar<PokemonSearchResult>
                model="pokemon"
                limit={10}
                placeholder="Search Pokémon by name or number..."
                hover
                size="md"
                renderResult={renderPokemonResult}
              />
            </div>
          </div>
        ) : (
          <div className="relative flex items-center justify-center h-48 lg:h-72 xl:h-96 2xl:h-112">
            {/* Artwork loads behind the text */}
            <Suspense fallback={<HeroArtworkSkeleton />}>
              <HeroArtwork />
            </Suspense>

            {/* Foreground content — always visible */}
            <div className="relative z-10">
              <div className="max-w-sm sm:max-w-md md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto px-4 sm:px-0">
                <p className="text-xl xl:text-2xl text-muted mx-auto text-left backdrop-blur-lg rounded-lg">
                  Comprehensive and accurate online resource for Pokémon game information across
                  every generation and region.
                </p>
              </div>
              <div className="mt-4 max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto h-16">
                <SearchBar<PokemonSearchResult>
                  model="pokemon"
                  limit={10}
                  placeholder="Search Pokémon by name or number..."
                  hover
                  size="md"
                  renderResult={renderPokemonResult}
                />
              </div>
            </div>
          </div>
        )}

        <QuickAccess />

        <Suspense fallback={<FeaturedContentSkeleton />}>
          <FeaturedContent />
        </Suspense>

        <LatestUpdates />
      </PageContent>
    </>
  );
};

export default IndexPage;
