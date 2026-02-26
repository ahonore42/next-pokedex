import { GetServerSideProps } from 'next/types';
import { useRouter } from 'next/dist/client/router';
import NextError from 'next/error';
import { useState, useMemo, useEffect } from 'react';
import type { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import { capitalizeName } from '~/utils/text';
import PokemonMoves from '~/components/pokemon/PokemonMoves';
import PokemonEncounters from '~/components/pokemon/PokemonEncounters';
import PageHeading from '~/components/layout/PageHeading';
import Button from '~/components/ui/buttons';
import PageContent from '~/components/layout/PageContent';
import { useBreakpointWidth } from '~/hooks';
import SectionCard from '~/components/ui/SectionCard';
import PokemonArtwork from '~/components/pokemon/PokemonArtwork';
import PokemonFormSwitcher from '~/components/pokemon/PokemonFormSwitcher';
import PokemonInfo from '~/components/pokemon/PokemonInfo';
import PokemonFlavorText from '~/components/pokemon/PokemonFlavorText';
import PokemonBaseStats from '~/components/pokemon/PokemonBaseStats';
import PokemonAbilities from '~/components/pokemon/PokemonAbilities';
import PokemonStatTable from '~/components/pokemon/PokemonStatTable';
import MobileEvolutionChain from '~/components/evolutions/MobileEvolutionChain';
import EvolutionChain from '~/components/evolutions/EvolutionChain';
import { usePageLoading } from '~/components/layout/DefaultLayout';

const PokemonSpeciesDetailPage: NextPageWithLayout = () => {
  const breakpointWidth = useBreakpointWidth();
  const [varietyId, setVarietyId] = useState<number | null>(null);

  // Data
  const { query, isReady } = useRouter();
  const id = Number(query.id);
  const { data, error, isLoading } = trpc.pokemon.pokemonWithSpecies.useQuery(
    { id, name: undefined },
    { enabled: isReady && !Number.isNaN(id), retry: false, staleTime: 60_000 },
  );

  // The active variety's ID drives the moves/encounters queries so they can
  // fire in parallel with the main query and update when the user switches forms.
  const activePokemonId = varietyId ?? id;
  const queryEnabled = isReady && !Number.isNaN(id);

  const { data: moves = [], isLoading: movesLoading } = trpc.pokemon.movesForPokemon.useQuery(
    { pokemonId: activePokemonId },
    { enabled: queryEnabled, staleTime: Infinity },
  );

  const { data: encounters = [], isLoading: encountersLoading } =
    trpc.pokemon.encountersForPokemon.useQuery(
      { pokemonId: activePokemonId },
      { enabled: queryEnabled, staleTime: Infinity },
    );

  // Evolution chain loads lazily once the species ID is known.
  // speciesId is 0 before data resolves — the query stays disabled until then.
  const speciesId = data?.pokemonSpecies?.id ?? 0;
  const { data: evolutionChain, isLoading: evolutionLoading } =
    trpc.evolutionChains.bySpeciesId.useQuery(
      { speciesId },
      { enabled: speciesId > 0, staleTime: Infinity },
    );

  // Memoised derived values
  const { species, speciesName, activePokemon, nationalDexNumber, genus } = useMemo(() => {
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
    const speciesName = species.names[0].name;
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
      speciesName,
      activePokemon: pokemon,
      nationalDexNumber,
      genus,
      generationId: species.generationId,
    };
  }, [data, id, varietyId]);

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

  const isPageLoading = !isReady || isLoading || !activePokemon;
  usePageLoading(isPageLoading);

  if (error || Number.isNaN(id))
    return <NextError title={error?.message ?? 'Pokémon not found'} statusCode={404} />;

  // Guard: keep hooks above, render nothing while layout shows the spinner
  if (isPageLoading) return null;

  const activePokemonName = capitalizeName(activePokemon.name);

  return (
    <>
      <PageHeading
        pageTitle={`${activePokemonName} - Pokédex`}
        metaDescription={`Complete ${activePokemonName} guide: stats, abilities, moves, evolution. National Dex #${nationalDexNumber}.`}
        ogImage={activePokemon.sprites?.officialArtworkFront || ''}
        schemaType="Article"
        breadcrumbLinks={[
          { label: 'Home', href: '/' },
          { label: `Pokédex`, href: `/pokedex` },
        ]}
        currentPage={activePokemonName}
        title={activePokemonName}
        subtitle={`#${nationalDexNumber.toString().padStart(3, '0')} • ${genus}`}
      />
      <PageContent>
        {/* <PokemonHeader
          pokemon={activePokemon}
          species={species}
          onPokemonSwitch={handlePokemonSwitch}
        /> */}

        <SectionCard colorVariant="article">
          <div className="flex flex-col gap-4">
            <PokemonArtwork pokemon={activePokemon} />
            <div className="w-full flex justify-center items-center">
              <PokemonFormSwitcher
                speciesPokemon={species.pokemon}
                speciesName={speciesName}
                activePokemon={activePokemon}
                onPokemonSwitch={handlePokemonSwitch}
              />
            </div>
            {/* Pokemon Info */}
            <PokemonInfo pokemon={activePokemon} species={species} />

            <SectionCard variant="compact">
              {/* Flavor Text */}
              <PokemonFlavorText flavorTexts={species.flavorTexts} />
            </SectionCard>
          </div>
        </SectionCard>
        {/* <SectionCard colorVariant="article" className="grid grid-cols-1 gap-4"> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PokemonBaseStats stats={activePokemon.stats} />
          {/* Abilities Section */}
          <SectionCard title="Abilities" variant="compact">
            <PokemonAbilities pokemon={activePokemon} />
          </SectionCard>
        </div>
        <PokemonStatTable stats={activePokemon.stats} />

        {/* Evolution Chain — deferred; skeleton shown while loading */}
        {evolutionLoading ? (
          <SectionCard title="Evolution Chain" variant="compact">
            <div className="h-28 animate-pulse rounded-lg bg-surface" />
          </SectionCard>
        ) : evolutionChain?.pokemonSpecies.length ? (
          <div className="animate-fade-in">
            {breakpointWidth < 640 ? (
              <SectionCard title="Evolution Chain" variant="compact">
                <MobileEvolutionChain chain={evolutionChain} />
              </SectionCard>
            ) : (
              <SectionCard title="Evolution Chain" variant="compact">
                <EvolutionChain chain={evolutionChain} />
              </SectionCard>
            )}
          </div>
        ) : null}

        {/* Encounters — deferred */}
        {!encountersLoading && encounters.length > 0 && (
          <div className="animate-fade-in">
            <PokemonEncounters encounters={encounters} />
          </div>
        )}

        {/* Moves — deferred */}
        {!movesLoading && moves.length > 0 && (
          <div className="animate-fade-in">
            <PokemonMoves moves={moves} />
          </div>
        )}

        <Button
          variant="brand"
          iconLeft="up"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to Top
        </Button>
      </PageContent>
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
