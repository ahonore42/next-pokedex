import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import SectionCard from '~/components/ui/SectionCard';
import PageHeading from '~/components/layout/PageHeading';
import PokedexDisplay from '~/components/pokemon/PokedexDisplay';
import InteractiveLink from '~/components/ui/InteractiveLink';
import { PokedexEntries } from '~/server/routers/_app';
import { useEffect, useState } from 'react';
import FilterButtons, { FilterOption } from '~/components/ui/buttons/FilterButtons';

const PokedexSelectionPage: NextPageWithLayout = () => {
  const [nationalDex, setNationalDex] = useState<PokedexEntries>();
  const [currentGenFilter, setCurrentGenFilter] = useState<number | 'all'>('all');

  const generationsResponse = trpc.pokemon.pokedexByGeneration.useQuery();
  const { data, isLoading } = generationsResponse;

  // Initialize nationalDex with national data when available
  useEffect(() => {
    if (data?.national) {
      setNationalDex(data.national);
    }
  }, [data?.national]);

  // Use the usePageLoading hook to manage loading state
  const isPageLoading = isLoading || !data?.national;

  if (isPageLoading) {
    return null; // Let DefaultLayout handle the loading display
  }

  const { national, generations } = data;

  const getPokemonSpeciesUpToGeneration = (
    gens: typeof generations,
    targetGeneration: number,
  ): PokedexEntries => {
    const combinedPokemonSpecies = gens
      .filter((generation) => generation.id <= targetGeneration)
      .flatMap((generation) => generation.pokemonSpecies)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((species, index) => ({
        ...species,
        pokedexNumbers: [{ pokedexNumber: index + 1 }, ...species.pokedexNumbers.slice(1)],
      }));

    return {
      id: 1,
      name: `generations-1-to-${targetGeneration}`,
      pokemonSpecies: combinedPokemonSpecies,
    };
  };

  const handleDexFilter = (genFilter: number | 'all') => {
    setCurrentGenFilter(genFilter);
    if (genFilter === 'all') {
      setNationalDex(national);
    } else {
      const filteredDex = getPokemonSpeciesUpToGeneration(generations, genFilter);
      setNationalDex(filteredDex);
    }
  };

  // Filter options for the FilterButtons component
  const filterOptions: FilterOption<number | 'all'>[] = [
    { value: 'all', label: 'Canon' },
    ...Array.from({ length: 9 }, (_, i) => ({
      value: i + 1,
      label: `Gen ${i + 1}`,
    })),
  ];

  // Regional Pokédexes by Generation
  const regionalDexes = generations.map((generation) => (
    <InteractiveLink
      key={generation.id}
      href={`/pokedex/${generation.id}`}
      ariaLabel={`Gen ${generation.id} Pokédex`}
      showArrow
      title={`Gen ${generation.id} Pokédex`}
      className="whitespace-nowrap leading-none text-sm"
    />
  ));

  return (
    <>
      <PageHeading
        pageTitle="National Pokédex - Complete Pokémon Database"
        metaDescription="Browse the complete National Pokédex with all Pokémon species from every generation. Search, filter, and explore detailed information for all 1000+ Pokémon."
        ogImage="/national-pokedex-preview.png"
        schemaType="WebPage"
        breadcrumbLinks={[{ label: 'Home', href: '/' }]}
        currentPage="National Pokédex"
        title="National Pokédex"
        subtitle="Complete index of Pokémon species"
      />

      <SectionCard
        title="Regional Pokédexes by Generation"
        className="mb-8"
        colorVariant="transparent"
      >
        <div className="flex flex-col items-center space-y-8">
          {/* Generation Pokemon Data Display */}
          <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-9 gap-4 xl:gap-2">
              {regionalDexes}
            </div>
          </div>
        </div>
      </SectionCard>
      {/* National Pokédex - Featured prominently */}
      <div className="flex items-center justify-between flex-wrap mb-6 gap-y-4">
        <h2 className="text-2xl font-bold">Pokémon Species</h2>
        <FilterButtons
          currentFilter={currentGenFilter}
          options={filterOptions}
          onFilterChange={handleDexFilter}
        />
      </div>
      {nationalDex && <PokedexDisplay pokedex={nationalDex} />}
    </>
  );
};

export default PokedexSelectionPage;
