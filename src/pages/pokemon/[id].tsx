import { GetServerSideProps } from 'next/types';
import { useRouter } from 'next/dist/client/router';
import NextError from 'next/error';
import { useState, useMemo, useEffect, Suspense, useTransition } from 'react';
import clsx from 'clsx';
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
import { EvolutionChainSkeleton, SecondaryCardSkeleton, PokemonDetailSkeleton } from '~/components/ui/skeletons';

// ── Secondary section inner components ──────────────────────────────────────

function PokemonEvolutionContent({
  speciesId,
  breakpointWidth,
}: {
  speciesId: number;
  breakpointWidth: number;
}) {
  const [evolutionChain] = trpc.evolutionChains.bySpeciesId.useSuspenseQuery(
    { speciesId },
    { staleTime: Infinity },
  );

  if (!evolutionChain?.pokemonSpecies.length) return null;

  return (
    <div className="animate-fade-in">
      <SectionCard title="Evolution Chain" variant="compact">
        {breakpointWidth < 640 ? (
          <MobileEvolutionChain chain={evolutionChain} />
        ) : (
          <EvolutionChain chain={evolutionChain} />
        )}
      </SectionCard>
    </div>
  );
}

function PokemonEncountersContent({ pokemonId }: { pokemonId: number }) {
  const [encounters] = trpc.pokemon.encountersForPokemon.useSuspenseQuery(
    { pokemonId },
    { staleTime: Infinity },
  );

  if (!encounters.length) return null;

  return (
    <div className="animate-fade-in">
      <PokemonEncounters encounters={encounters} />
    </div>
  );
}

function PokemonMovesContent({ pokemonId }: { pokemonId: number }) {
  const [moves] = trpc.pokemon.movesForPokemon.useSuspenseQuery(
    { pokemonId },
    { staleTime: Infinity },
  );

  if (!moves.length) return null;

  return (
    <div className="animate-fade-in">
      <PokemonMoves moves={moves} />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const PokemonSpeciesDetailPage: NextPageWithLayout = () => {
  const breakpointWidth = useBreakpointWidth();
  const [varietyId, setVarietyId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const { query, isReady } = useRouter();
  const id = Number(query.id);
  const { data, error, isLoading } = trpc.pokemon.pokemonWithSpecies.useQuery(
    { id, name: undefined },
    { enabled: isReady && !Number.isNaN(id), retry: false, staleTime: 60_000 },
  );

  const activePokemonId = varietyId ?? id;

  const { species, speciesName, activePokemon, nationalDexNumber, genus } = useMemo(() => {
    if (!data) {
      return { species: null, speciesName: '', activePokemon: null, nationalDexNumber: 0, genus: '', generationId: 0 };
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

    return { species, speciesName, activePokemon: pokemon, nationalDexNumber, genus, generationId: species.generationId };
  }, [data, id, varietyId]);

  // Preload artwork for snappy shiny toggle
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

  const handlePokemonSwitch = (nextId: number) => {
    startTransition(() => setVarietyId(nextId));
  };

  if (error || Number.isNaN(id))
    return <NextError title={error?.message ?? 'Pokémon not found'} statusCode={404} />;

  const activePokemonName = activePokemon ? capitalizeName(activePokemon.name) : '';
  const speciesId = data?.pokemonSpecies.id ?? 0;

  return (
    <>
      <PageHeading
        pageTitle={activePokemonName ? `${activePokemonName} - Pokédex` : 'Pokédex'}
        metaDescription={
          activePokemonName
            ? `Complete ${activePokemonName} guide: stats, abilities, moves, evolution. National Dex #${nationalDexNumber}.`
            : 'Pokémon details - Evolve Pokédex'
        }
        ogImage={activePokemon?.sprites?.officialArtworkFront || ''}
        schemaType="Article"
        breadcrumbLinks={[
          { label: 'Home', href: '/' },
          { label: 'Pokédex', href: '/pokedex' },
        ]}
        currentPage={activePokemonName || `#${id}`}
        title={activePokemonName || `#${id}`}
        subtitle={
          activePokemon
            ? `#${nationalDexNumber.toString().padStart(3, '0')} • ${genus}`
            : `#${id.toString().padStart(3, '0')}`
        }
      />
      {isLoading || !activePokemon ? (
        <PokemonDetailSkeleton />
      ) : (
        <PageContent>
          <SectionCard colorVariant="article">
            <div className="flex flex-col gap-4">
              <PokemonArtwork pokemon={activePokemon} />
              <div className="w-full flex justify-center items-center">
                <PokemonFormSwitcher
                  speciesPokemon={species!.pokemon}
                  speciesName={speciesName}
                  activePokemon={activePokemon}
                  onPokemonSwitch={handlePokemonSwitch}
                />
              </div>
              <PokemonInfo pokemon={activePokemon} species={species!} />
              <SectionCard variant="compact">
                <PokemonFlavorText flavorTexts={species!.flavorTexts} />
              </SectionCard>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PokemonBaseStats stats={activePokemon.stats} />
            <SectionCard title="Abilities" variant="compact">
              <PokemonAbilities pokemon={activePokemon} />
            </SectionCard>
          </div>
          <PokemonStatTable stats={activePokemon.stats} />

          {/* Secondary sections — each deferred independently */}
          <div className={clsx('flex flex-col gap-4 transition-opacity duration-200', isPending && 'opacity-50')}>
            <Suspense fallback={<EvolutionChainSkeleton />}>
              <PokemonEvolutionContent speciesId={speciesId} breakpointWidth={breakpointWidth} />
            </Suspense>

            <Suspense fallback={<SecondaryCardSkeleton title="Locations" />}>
              <PokemonEncountersContent pokemonId={activePokemonId} />
            </Suspense>

            <Suspense fallback={<SecondaryCardSkeleton title="Moves" />}>
              <PokemonMovesContent pokemonId={activePokemonId} />
            </Suspense>
          </div>

          <Button
            variant="brand"
            iconLeft="up"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to Top
          </Button>
        </PageContent>
      )}
    </>
  );
};

export default PokemonSpeciesDetailPage;

// Server-side rendering for SEO and performance
export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;

  if (!id || isNaN(parseInt(id, 10))) {
    return { notFound: true };
  }

  return {
    props: {
      id: parseInt(id, 10),
    },
  };
};
