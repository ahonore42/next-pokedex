import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import NextError from 'next/error';
import Head from 'next/head';
import Link from 'next/link';
import { trpc } from '~/utils/trpc';
import type { NextPageWithLayout } from '~/pages/_app';
import { capitalizeName } from '~/utils/pokemon';
import Pokeball from '~/components/ui/Pokeball';
import PokemonHeader from '~/components/pokemon/PokemonHeader';
import PokemonStats from '~/components/pokemon/PokemonStats';
import { PokemonAbilities } from '~/components/pokemon/PokemonAbilities';
import { PokemonForms } from '~/components/pokemon/PokemonForms';
import { PokemonMoves } from '~/components/pokemon/PokemonMoves';
import { EvolutionChain } from '~/components/pokemon/EvolutionChain';
import { PokemonEncounters } from '~/components/pokemon/PokemonEncounters';
import { PokemonBreeding } from '~/components/pokemon/PokemonBreeding';
import { PokemonGameData } from '~/components/pokemon/PokemonGameData';

const PokemonDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const pokemonId = parseInt(router.query.id as string, 10);

  const pokemonQuery = trpc.pokemon.detailedById.useQuery(
    { id: pokemonId },
    {
      enabled: !isNaN(pokemonId),
      retry: false,
    },
  );

  // Handle loading state
  if (pokemonQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Pokeball size="xl" endlessSpin spinSpeed={1.5} />
          <p className="mt-4 text-lg text-gray-600">Loading Pokémon data...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (pokemonQuery.error) {
    return (
      <NextError
        title={pokemonQuery.error.message}
        statusCode={pokemonQuery.error.data?.httpStatus ?? 404}
      />
    );
  }

  // Handle invalid ID or no data
  if (isNaN(pokemonId) || !pokemonQuery.data) {
    return <NextError statusCode={404} title="Pokemon not found" />;
  }

  const pokemon = pokemonQuery.data;
  const pokemonName = capitalizeName(pokemon.name);
  // const speciesName = pokemon.pokemonSpecies.names[0]?.name || pokemonName;

  return (
    <>
      <Head>
        <title>{pokemonName} - Pokédex</title>
        <meta
          name="description"
          content={`Complete information about ${pokemonName} including stats, abilities, moves, evolution, and more.`}
        />
        <meta property="og:title" content={`${pokemonName} - Pokédex`} />
        <meta
          property="og:description"
          content={
            pokemon.pokemonSpecies.flavorTexts[0]?.flavorText || `Information about ${pokemonName}`
          }
        />
        <meta property="og:image" content={pokemon.sprites?.frontDefault || ''} />
      </Head>

      <div
        className="min-h-screen transition-colors duration-300"
        style={{ backgroundColor: 'var(--color-background)' }}
      >

        <main className="mx-auto py-8">
          {/* Breadcrumb Navigation */}
          <nav className="mb-6">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/pokemon" className="text-blue-600 hover:text-blue-800 transition-colors">
                Pokédex
              </Link>
              <span>/</span>
              <span className="text-gray-500">
                #{pokemon.id.toString().padStart(3, '0')} {pokemonName}
              </span>
            </div>
          </nav>

          {/* Main Pokemon Header */}
          <PokemonHeader pokemon={pokemon} />

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Left Column - Primary Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Abilities Section */}
              <PokemonAbilities pokemon={pokemon} />

              {/* Stats Section */}
              <PokemonStats pokemon={pokemon} />

              {/* Forms Section */}
              {pokemon.forms.length > 1 && <PokemonForms pokemon={pokemon} />}
            </div>

            {/* Right Column - Secondary Info */}
            <div className="space-y-8">
              {/* Evolution Chain */}
              <EvolutionChain pokemon={pokemon} />

              {/* Breeding Info */}
              <PokemonBreeding pokemon={pokemon} />

              {/* Game Data */}
              <PokemonGameData pokemon={pokemon} />

              {/* Encounters */}
              <PokemonEncounters pokemon={pokemon} />
            </div>
          </div>

          {/* Moves Section */}
          <div className="mt-8">
            <PokemonMoves pokemon={pokemon} />
          </div>

          {/* Back to Top Button */}
          <div className="mt-12 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

export default PokemonDetailPage;

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
