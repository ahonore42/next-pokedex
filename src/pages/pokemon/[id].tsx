import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import NextError from 'next/error';
import { useState, useMemo, useEffect } from 'react';
import type { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import { capitalizeName } from '~/utils/text';
import PokemonMoves from '~/components/pokemon/PokemonMoves';
import PokemonGameData from '~/components/pokemon/PokemonGameData';
import PokemonEncounters from '~/components/pokemon/PokemonEncounters';
import PokemonHeader from '~/components/pokemon/PokemonHeader';
import PokemonStats from '~/components/pokemon/PokemonStats';
import PageHeading from '~/components/layout/PageHeading';

const PokemonSpeciesDetailPage: NextPageWithLayout = () => {
  const { query, isReady } = useRouter();
  const id = Number(query.id);

  // Data
  const { data, error, isLoading } = trpc.pokemon.pokemonWithSpecies.useQuery(
    { id },
    { enabled: isReady && !Number.isNaN(id), retry: false, staleTime: 60_000 },
  );

  // Local selection state
  const [varietyId, setVarietyId] = useState<number | null>(null);

  // Memoised derived values
  const { species, activePokemon, nationalDexNumber, genus, generationId } = useMemo(() => {
    if (!data) {
      return {
        species: null,
        activePokemon: null,

        nationalDexNumber: 0,
        genus: '',
        generationId: 0,
      };
    }

    const species = data.pokemonSpecies;
    const varieties = species.pokemon;
    const pokemon =
      varieties.find((p) => p.id === (varietyId ?? id)) ??
      varieties.find((p) => p.isDefault) ??
      varieties[0];
    const nationalDexNumber =
      species.pokedexNumbers.find((e) => e.pokedex.isMainSeries && e.pokedex.name === 'national')
        ?.pokedexNumber ?? pokemon.id;

    const genus = species.names[0]?.genus ?? '';

    return {
      species,
      activePokemon: pokemon,
      nationalDexNumber,
      genus,
      generationId: species.generationId,
    };
  }, [data, id, varietyId]);

  const pokemonStats = useMemo(
    () =>
      activePokemon && (
        <PokemonStats stats={activePokemon.stats} baseExperience={activePokemon.baseExperience} />
      ),
    [activePokemon],
  );

  const pokemonGameData = useMemo(
    () =>
      species && (
        <PokemonGameData
          pokedexNumbers={species.pokedexNumbers}
          captureRate={species.captureRate}
          baseHappiness={species.baseHappiness}
        />
      ),
    [species],
  );

  const pokemonEncounters = useMemo(
    () => activePokemon && <PokemonEncounters encounters={activePokemon.encounters} />,
    [activePokemon],
  );

  const pokemonMoves = useMemo(
    () => activePokemon && <PokemonMoves pokemon={activePokemon} />,
    [activePokemon],
  );

  // Preload artwork
  useEffect(() => {
    if (!activePokemon?.sprites) return;
    [
      activePokemon.sprites.officialArtworkFront,
      activePokemon.sprites.officialArtworkShiny,
    ].forEach((url) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
    });
  }, [activePokemon?.sprites]);

  // Client-side navigation
  const handlePokemonSwitch = (nextId: number) => {
    setVarietyId(nextId);
  };

  const activePokemonName = capitalizeName(activePokemon?.name ?? '');
  // Loading & error
  const isPageLoading = !isReady || isLoading || !activePokemon;
  if (isPageLoading) return null;
  if (error || Number.isNaN(id))
    return <NextError title={error?.message ?? 'Pokémon not found'} statusCode={404} />;

  return (
    <>
      <PageHeading
        pageTitle={`${activePokemonName} - Pokédex`}
        metaDescription={`Complete ${activePokemonName} guide: stats, abilities, moves, evolution. National Dex #${nationalDexNumber}.`}
        ogImage={activePokemon.sprites?.officialArtworkFront || ''}
        schemaType="Article"
        breadcrumbLinks={[
          { label: 'Home', href: '/' },
          { label: `Gen ${generationId} Pokédex`, href: `/pokedex/${generationId}` },
        ]}
        currentPage={activePokemonName}
        title={activePokemonName}
        titleMetadata={`#${nationalDexNumber.toString().padStart(3, '0')}`}
        subtitle={genus}
      />
      <div className="min-h-screen bg-background">
        <main className="mx-auto">
          <PokemonHeader
            pokemon={activePokemon}
            species={species}
            onPokemonSwitch={handlePokemonSwitch}
          />

          <div className="grid grid-cols-1 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">{pokemonStats}</div>
          </div>

          <div className="space-y-8 mt-8">{pokemonGameData}</div>

          <div className="mt-8">{pokemonEncounters}</div>

          <div className="mt-8">{pokemonMoves}</div>
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
