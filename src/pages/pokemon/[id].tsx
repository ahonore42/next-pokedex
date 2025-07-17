import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import NextError from 'next/error';
import { useState, useMemo, useEffect } from 'react';
import type { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import { usePageLoading } from '~/lib/contexts/LoadingContext';
import type { PokemonInSpecies } from '~/server/routers/_app';
import { getRegionFromVersionGroup } from '~/utils/pokemon';
import { PokemonMoves } from '~/components/pokemon/PokemonMoves';
import { PokemonEncounters } from '~/components/pokemon/PokemonEncounters';
import { PokemonGameData } from '~/components/pokemon/PokemonGameData';
import PokemonHeader from '~/components/pokemon/PokemonHeader';
import PokemonStats from '~/components/pokemon/PokemonStats';
import PageHeading from '~/components/layout/PageHeading';
import { capitalizeName } from '~/utils/text';

const PokemonSpeciesDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const pokemonId = parseInt(router.query.id as string, 10);

  // State for selected Pokemon and form - MUST be at the top before any conditionals
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  // First, get the Pokemon to find its species ID
  const pokemonQuery = trpc.pokemon.byId.useQuery(
    { id: pokemonId },
    {
      enabled: !isNaN(pokemonId),
      retry: false,
    },
  );

  // Then get the full species data using the species ID
  const speciesQuery = trpc.pokemon.speciesById.useQuery(
    { id: pokemonQuery.data?.pokemonSpecies.id || 0 },
    {
      enabled: !!pokemonQuery.data?.pokemonSpecies.id,
      retry: false,
    },
  );

  // Optimized preload hook
  useEffect(() => {
    if (pokemonQuery.data?.sprites) {
      const { officialArtworkFront, officialArtworkShiny } = pokemonQuery.data.sprites;
      const preloadLinks: HTMLLinkElement[] = [];

      // Preload both images immediately when data is available
      [officialArtworkFront, officialArtworkShiny].forEach((url: string | null | undefined) => {
        if (!url) return;

        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        link.fetchPriority = 'high';
        link.crossOrigin = 'anonymous';

        document.head.appendChild(link);
        preloadLinks.push(link);
      });

      return () => {
        preloadLinks.forEach((link) => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        });
      };
    }
  }, [pokemonQuery.data?.sprites]);

  // Handler to switch Pokemon
  const handlePokemonSwitch = (newPokemonId: number) => {
    setSelectedPokemonId(newPokemonId);
    setSelectedFormId(null); // Reset form when switching Pokemon
  };

  /**
   * Function to get the currently active Pokemon and form
   * Priority: Selected Pokemon → Originally requested Pokemon → Primary Pokemon
   * MUST be declared before any conditional returns to maintain hook order
   */
  const getActivePokemonAndForm = useMemo(() => {
    // Early return if no species data yet
    if (!speciesQuery.data) {
      return { pokemon: null, form: null };
    }

    const species = speciesQuery.data;
    const primaryPokemon = species.pokemon.find((p) => p.isDefault) || species.pokemon[0];
    // Find the Pokemon to display
    let activePokemon: PokemonInSpecies;

    if (selectedPokemonId) {
      // User has selected a specific Pokemon
      activePokemon = species.pokemon.find((p) => p.id === selectedPokemonId) || primaryPokemon;
    } else {
      // Use the originally requested Pokemon, or fall back to primary
      activePokemon = species.pokemon.find((p) => p.id === pokemonId) || primaryPokemon;
    }

    // Find the form to display
    let activeForm = null;
    if (selectedFormId && activePokemon.forms.length > 0) {
      activeForm = activePokemon.forms.find((f) => f.id === selectedFormId) || null;
    }

    return {
      pokemon: activePokemon,
      form: activeForm,
    };
  }, [speciesQuery.data, selectedPokemonId, selectedFormId, pokemonId]);

  // Use the usePageLoading hook to manage loading state
  const isPageLoading = pokemonQuery.isLoading || speciesQuery.isLoading;
  usePageLoading(isPageLoading);

  // Handle loading state
  if (pokemonQuery.isLoading || speciesQuery.isLoading) {
    return null;
  }
  // Handle error state
  if (pokemonQuery.error || speciesQuery.error) {
    const error = pokemonQuery.error || speciesQuery.error;
    return (
      <NextError
        title={error?.message || 'Error loading Pokemon data'}
        statusCode={error?.data?.httpStatus ?? 404}
      />
    );
  }
  // Handle invalid ID or no data
  if (isNaN(pokemonId) || !pokemonQuery.data || !speciesQuery.data) {
    return <NextError statusCode={404} title="Pokemon not found" />;
  }

  // Get the species and default/primary Pokemon for this species, or the first one if no default
  const species = speciesQuery.data;
  const primaryPokemon = species.pokemon.find((p) => p.isDefault) || species.pokemon[0];
  // If somehow no Pokemon exist for this species, show error
  if (!primaryPokemon) {
    return <NextError statusCode={404} title="No Pokemon found for this species" />;
  }

  const { pokemon: activePokemon } = getActivePokemonAndForm;
  // Additional null check for activePokemon since useMemo can return null during loading
  if ((!species && !activePokemon) || !activePokemon?.forms[0]?.versionGroup) {
    return null;
  }

  const activePokemonName = capitalizeName(activePokemon.name);
  // const speciesFlavorText = species.flavorTexts[0]?.flavorText;
  const activePokemonRegion = getRegionFromVersionGroup(activePokemon.forms[0].versionGroup);
  const genus = species.names[0]?.genus || '';
  const nationalDexNumber =
    species.pokedexNumbers.find(
      (entry) => entry.pokedex.isMainSeries && entry.pokedex.name === 'national',
    )?.pokedexNumber || primaryPokemon.id;

  return (
    <>
      <PageHeading
        pageTitle={`${activePokemonName} - Pokédex`}
        metaDescription={`Complete ${activePokemonName} guide: stats, abilities, moves, evolution. National Dex #${nationalDexNumber}.`}
        ogImage={activePokemon.sprites?.officialArtworkFront || ''}
        schemaType="Article"
        breadcrumbLinks={[
          { label: 'Home', href: '/' },
          {
            label: `${activePokemonRegion?.displayName} Pokédex`,
            href: `/pokedex/${activePokemonRegion?.name}`,
          },
        ]}
        currentPage={activePokemonName}
        title={activePokemonName}
        titleMetadata={`#${nationalDexNumber.toString().padStart(3, '0')}`}
        subtitle={genus}
      />
      <div className="min-h-screen bg-background">
        <main className="mx-auto">
          {/* Pokemon Header - using the active Pokemon with species data */}
          <PokemonHeader
            pokemon={activePokemon}
            species={species}
            onPokemonSwitch={handlePokemonSwitch}
          />

          {/* Content Grid - Focus on Active Pokemon */}
          <div className="grid grid-cols-1 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Section - Active Pokemon */}
              <PokemonStats
                stats={activePokemon.stats}
                baseExperience={activePokemon.baseExperience}
              />
            </div>
          </div>

          {/* Secondary Info */}
          <div className="space-y-8 mt-8">
            {/* Game Data - Active Pokemon */}
            <PokemonGameData
              pokedexNumbers={species.pokedexNumbers}
              captureRate={species.captureRate}
              baseHappiness={species.baseHappiness}
            />
          </div>

          {/* Encounters - Active Pokemon */}
          <div className="mt-8">
            <PokemonEncounters encounters={activePokemon.encounters} />
          </div>

          {/* Moves Section - Active Pokemon */}
          <div className="mt-8">
            <PokemonMoves pokemon={activePokemon} />
          </div>

          {/* Back to Top Button */}
          <div className="mt-12 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center px-4 py-2 bg-brand hover:bg-brand-hover text-brand-text rounded-lg shadow-sm hover:shadow-md"
              aria-describedby="pokemon-title"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              Back to Top
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default PokemonSpeciesDetailPage;

// Server-side rendering for SEO and performance
export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;

  // Validate ID parameter
  if (!id || isNaN(parseInt(id, 10))) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      id: parseInt(id, 10),
    },
  };
};
