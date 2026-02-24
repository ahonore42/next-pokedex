import { NextPageWithLayout } from '../_app';
import { useMemo, useState } from 'react';
import SectionCard from '~/components/ui/SectionCard';
import PageHeading from '~/components/layout/PageHeading';
import PageContent from '~/components/layout/PageContent';
import FilterOptions, { FilterOption } from '~/components/ui/FilterOptions';
import Badge from '~/components/ui/Badge';
import { usePokemonCache } from '~/lib/contexts/PokedexCacheContext';
import { PokemonListData } from '~/lib/types';
import PokemonTabs from '~/components/pokedex/PokemonTabs';
import TypesDisplay from '~/components/pokemon-types/TypesDisplay';
import { getRgba, getTypeColor } from '~/utils';

const PokedexSelectionPage: NextPageWithLayout = () => {
  // Get all cached Pokemon data
  const {
    pokemonDataArray,
    pokemonDataIsLoading,
    generationsData,
    generationsLoading,
    getPokemonByGeneration,
    // getAllGenerations,
  } = usePokemonCache();
  const [currentGenFilter, setCurrentGenFilter] = useState<number | 'all'>('all');
  const [currentTypeFilter, setCurrentTypeFilter] = useState<string | null>(null);

  // Filter Pokemon by generation (simple filtering on already-cached data)
  const pokemonData: PokemonListData[] = useMemo(() => {
    let filteredData: PokemonListData[];
    if (currentGenFilter === 'all') {
      filteredData = pokemonDataArray;
    } else {
      filteredData = getPokemonByGeneration(currentGenFilter);
    }

    if (currentTypeFilter) {
      filteredData = filteredData.filter((pokemon) => pokemon.types.includes(currentTypeFilter));
    }
    return filteredData;
  }, [pokemonDataArray, currentGenFilter, currentTypeFilter, getPokemonByGeneration]);

  // Use the usePageLoading hook to manage loading state
  const isPageLoading =
    pokemonDataIsLoading ||
    generationsLoading ||
    !pokemonDataArray.length ||
    !generationsData?.length;

  if (isPageLoading) {
    return null; // Let DefaultLayout handle the loading display
  }

  const handleDexFilter = (genFilter: number | 'all') => {
    setCurrentGenFilter(genFilter);
  };

  const handleTypeChange = (type: string | null) => {
    setCurrentTypeFilter(type);
  };

  // Filter options for the FilterOptions component
  const generationFilterOptions: FilterOption<number | 'all'>[] = [
    { value: 'all', label: 'All' },
    ...Array.from({ length: 9 }, (_, i) => ({
      value: i + 1,
      label: `Gen ${i + 1}`,
    })),
  ];

  // Regional Pokédexes by Generation
  const regionalDexes = generationsData.map((generation) => (
    <Badge
      key={generation.id}
      className={'bg-indigo-600 dark:bg-indigo-700'}
      href={`/pokedex/${generation.id}`}
    >{`Gen ${generation.id}`}</Badge>
  ));

  const typeColor = currentTypeFilter ? getTypeColor(currentTypeFilter) : undefined;
  const bgOverlay = typeColor ? getRgba(typeColor, 0.1) : undefined;
  return (
    <PageContent className="max-h-dvh">
      <PageHeading
        pageTitle="National Pokédex - Complete Pokémon Database"
        metaDescription="Browse the complete National Pokédex with all Pokémon species from every generation. Search, filter, and explore detailed information for all 1000+ Pokémon."
        ogImage="/national-pokedex-preview.png"
        schemaType="WebPage"
        breadcrumbLinks={[{ label: 'Home', href: '/' }]}
        currentPage="Pokédex"
        title="National Pokédex"
        subtitle="Complete index of Pokémon species"
      />

      <div className="grid grid-cols-1 justify-center items-start max-w-2xl mx-auto">
        <SectionCard title="Generational Pokédexes" variant="compact" colorVariant="transparent">
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
      {/* National Pokédex - Featured prominently */}
      <div className="flex items-center justify-between flex-wrap gap-y-4 text-primary">
        <h2 className="text-xl font-bold">
          National Dex{' '}
          {currentGenFilter !== 'all' && (
            <span className="text-subtle text-lg">Gen {currentGenFilter}</span>
          )}
        </h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
          <span className="text-subtle">{pokemonData.length} Pokémon</span>
          <FilterOptions
            currentFilter={currentGenFilter}
            options={generationFilterOptions}
            onFilterChange={handleDexFilter}
          />
        </div>
      </div>
      {/* Priority-Based Sections */}
      <PokemonTabs data={pokemonData} tableStyle={bgOverlay} />
    </PageContent>
  );
};

export default PokedexSelectionPage;
