import { useRouter } from 'next/router';
import { useState, useMemo, useEffect } from 'react';
import { NextPageWithLayout } from '../_app';
import { usePokemonCache } from '~/lib/contexts/PokedexCacheContext';
import SectionCard from '~/components/ui/SectionCard';
import PageHeading from '~/components/layout/PageHeading';
import MetricsGrid from '~/components/ui/MetricsGrid';
import PageContent from '~/components/layout/PageContent';
import FilterOptions, { FilterOption } from '~/components/ui/FilterOptions';
import PokemonTabs from '~/components/pokedex/PokemonTabs';
import Badge from '~/components/ui/Badge';
import { getRgba, getTypeColor } from '~/utils';
import TypesDisplay from '~/components/pokemon-types/TypesDisplay';

const PokedexGenerationPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { generation } = router.query;

  const generationId = typeof generation === 'string' ? parseInt(generation) : null;

  const {
    getCachedPokemon,
    getRegionalPokedexesFromCache,
    generationsData,
    pokemonDataArray,
    pokemonDataIsLoading,
    pokemonError,
    regionalPokedexIsLoading,
  } = usePokemonCache();

  const [selectedPokedexId, setSelectedPokedexId] = useState<number | null>(null);
  const [currentTypeFilter, setCurrentTypeFilter] = useState<string | null>(null);

  // Array of pokedexes for this generation
  const regionalPokedexes = useMemo(
    () => (generationId ? getRegionalPokedexesFromCache(generationId) : null),
    [generationId, getRegionalPokedexesFromCache],
  );

  const selectedPokedex = useMemo(() => {
    if (!selectedPokedexId || !regionalPokedexes) return null;
    return regionalPokedexes.find((pokedex) => pokedex.id === selectedPokedexId) ?? null;
  }, [selectedPokedexId, regionalPokedexes]);

  const regionalPokemonArray = useMemo(() => {
    if (!selectedPokedex?.pokemon || pokemonDataArray?.length === 0) return [];
    // const orderedPokemon = selectedPokedex
    let filteredData = getCachedPokemon(selectedPokedex.pokemon);

    if (currentTypeFilter) {
      filteredData = filteredData.filter((pokemon) => pokemon.types.includes(currentTypeFilter));
    }
    return filteredData;
  }, [selectedPokedex, getCachedPokemon, pokemonDataArray, currentTypeFilter]);

  // Dropdown options based on pokedexes
  const pokedexOptions: FilterOption<number>[] = useMemo(
    () =>
      regionalPokedexes?.map((pokedex) => ({
        value: pokedex.id,
        label:
          pokedex.names?.[0]?.name ||
          pokedex.name
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
      })) ?? [],
    [regionalPokedexes],
  );

  // Default to first pokedex when data arrives
  useEffect(() => {
    if (!selectedPokedexId && regionalPokedexes?.length) {
      setSelectedPokedexId(regionalPokedexes[0].id);
    }
  }, [regionalPokedexes, selectedPokedexId]);

  const isPageLoading =
    pokemonDataIsLoading ||
    regionalPokedexIsLoading ||
    !generationId ||
    !generationsData ||
    regionalPokemonArray.length === 0;

  if (isPageLoading) return null;

  // No data for this generation
  if (!regionalPokedexes?.length) {
    return (
      <SectionCard title="No Data Found">
        <div className="text-center">
          <p className="text-lg text-secondary mb-4">
            No Pokédex data found for generation {generation}.
          </p>
          <button
            onClick={() => router.push('/pokedex')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Pokédex Selection
          </button>
        </div>
      </SectionCard>
    );
  }

  if (pokemonError) {
    return (
      <SectionCard title="Error Loading Pokémon Data">
        <div className="text-center">
          <p className="text-lg text-secondary mb-4">{pokemonError}</p>
          <button
            onClick={() => router.push('/pokedex')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Pokédex Selection
          </button>
        </div>
      </SectionCard>
    );
  }

  const regionalDexes = generationsData.map((generation) => (
    <Badge
      key={generation.id}
      className={'bg-indigo-600 dark:bg-indigo-700'}
      href={`/pokedex/${generation.id}`}
    >{`Gen ${generation.id}`}</Badge>
  ));

  // Handler
  const handlePokedexChange = (pokedexId: number) => {
    setSelectedPokedexId(pokedexId);
  };

  const handleTypeChange = (type: string | null) => {
    setCurrentTypeFilter(type);
  };

  const typeColor = currentTypeFilter ? getTypeColor(currentTypeFilter) : undefined;
  const bgOverlay = typeColor ? getRgba(typeColor, 0.1) : undefined;

  return (
    <>
      <PageHeading
        pageTitle={`Generation ${generationId} Pokédex - Regional Pokémon Directory`}
        metaDescription={`Browse all Pokémon from Generation ${generationId}. Complete directory with detailed information for each Pokémon across different regions.`}
        ogImage={`/pokedex-generation-${generationId}-preview.png`}
        schemaType="WebPage"
        breadcrumbLinks={[
          { label: 'Home', href: '/' },
          { label: 'Pokédex', href: '/pokedex' },
        ]}
        currentPage={`Generation ${generationId} Pokédex`}
        title={`Generation ${generationId} Pokédex`}
        subtitle={`${regionalPokedexes?.length ?? 0} Pokédex${regionalPokedexes?.length === 1 ? '' : 'es'} Available`}
      />

      <PageContent>
        <div className="grid grid-cols-1 justify-center items-start max-w-2xl mx-auto">
          <SectionCard title="Regional Pokédexes" variant="compact" colorVariant="transparent">
            {/* Generation Pokemon Data Display */}
            <div className="flex flex-wrap justify-center items-center gap-2">{regionalDexes}</div>
          </SectionCard>
          <SectionCard title="Filter by Type" variant="compact" colorVariant="transparent">
            <TypesDisplay
              onClick={handleTypeChange}
              selectedType={currentTypeFilter}
              allTypes={true}
              link={false}
            />
          </SectionCard>
        </div>
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">Generation {generationId} Pokédex</h2>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
              {regionalPokedexes?.length ?? 0} Pokédex
              {(regionalPokedexes?.length ?? 0) === 1 ? '' : 'es'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Pokédex Selector */}
            {(regionalPokedexes?.length ?? 0) > 1 && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Pokédex:</label>
                <FilterOptions<number>
                  currentFilter={selectedPokedexId ?? regionalPokedexes?.[0]?.id}
                  options={pokedexOptions}
                  onFilterChange={handlePokedexChange}
                  placeholder="Select Pokédex"
                />
              </div>
            )}
          </div>
        </div>

        {/* Pokémon Display */}
        <PokemonTabs
          data={regionalPokemonArray}
          tableStyle={bgOverlay}
          containerHeight="max-h-240"
        />
      </PageContent>
    </>
  );
};

export default PokedexGenerationPage;
