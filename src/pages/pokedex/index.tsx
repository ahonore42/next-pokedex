import { useState, Suspense, useTransition, useMemo } from 'react';
import clsx from 'clsx';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { PokemonListData } from '~/lib/types';
import SectionCard from '~/components/ui/SectionCard';
import PageHeading from '~/components/layout/PageHeading';
import PageContent from '~/components/layout/PageContent';
import FilterOptions, { FilterOption } from '~/components/ui/FilterOptions';
import Badge from '~/components/ui/Badge';
import PokemonTabs from '~/components/pokedex/PokemonTabs';
import TypesDisplay from '~/components/pokemon-types/TypesDisplay';
import { getRgba, getTypeColor } from '~/utils';
import SkeletonTableRow from '~/components/ui/skeletons/SkeletonTableRow';
import { pokemonColumns } from '~/components/ui/tables';

const GENERATIONS = Array.from({ length: 9 }, (_, i) => i + 1);

function PokedexSkeleton() {
  return (
    <div className="rounded-lg overflow-scroll border-2 border-border">
      <table className="table-fixed w-full border-collapse divide-y divide-border">
        <tbody>
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonTableRow key={i} columns={pokemonColumns} rowHeight="h-8" />
          ))}
        </tbody>
      </table>
    </div>
  );
}

type PokedexContentProps = {
  genFilter: number | 'all';
  typeFilter: string | null;
};

function PokedexContent({ genFilter, typeFilter }: PokedexContentProps) {
  const [pokemonQueryData] = trpc.pokedex.pokedexByGeneration.useSuspenseQuery(undefined, {
    staleTime: Infinity,
  });
  const [generationsData] = trpc.pokedex.generationPokemonIds.useSuspenseQuery(undefined, {
    staleTime: Infinity,
  });

  const pokemonDataArray = pokemonQueryData.national.pokemonListData;

  const pokemonIdsByGen = useMemo(() => {
    const map = new Map<number, number[]>();
    generationsData.forEach((gen) => map.set(gen.id, gen.pokemonIds));
    return map;
  }, [generationsData]);

  const filteredPokemon = useMemo((): PokemonListData[] => {
    let data: PokemonListData[];
    if (genFilter === 'all') {
      data = pokemonDataArray;
    } else {
      const includedIds = new Set<number>();
      for (let g = 1; g <= genFilter; g++) {
        pokemonIdsByGen.get(g)?.forEach((id) => includedIds.add(id));
      }
      data = pokemonDataArray.filter((p) => includedIds.has(p.pokemonId));
    }
    if (typeFilter) {
      data = data.filter((p) => p.types.includes(typeFilter));
    }
    return data;
  }, [pokemonDataArray, pokemonIdsByGen, genFilter, typeFilter]);

  const typeColor = typeFilter ? getTypeColor(typeFilter) : undefined;
  const bgOverlay = typeColor ? getRgba(typeColor, 0.1) : undefined;

  return (
    <>
      <span className="text-subtle text-sm text-right">{filteredPokemon.length} Pokémon</span>
      <PokemonTabs data={filteredPokemon} tableStyle={bgOverlay} disableVirtualScroll />
    </>
  );
}

const PokedexSelectionPage: NextPageWithLayout = () => {
  const [currentGenFilter, setCurrentGenFilter] = useState<number | 'all'>('all');
  const [currentTypeFilter, setCurrentTypeFilter] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const generationFilterOptions: FilterOption<number | 'all'>[] = [
    { value: 'all', label: 'All' },
    ...GENERATIONS.map((i) => ({ value: i, label: `Gen ${i}` })),
  ];

  return (
    <PageContent>
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
          <div className="flex flex-wrap justify-center items-center gap-2">
            {GENERATIONS.map((gen) => (
              <Badge key={gen} className="bg-indigo-600 dark:bg-indigo-700" href={`/pokedex/${gen}`}>
                {`Gen ${gen}`}
              </Badge>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Filter by Type" variant="compact" colorVariant="transparent">
          <TypesDisplay
            onClick={(type) => startTransition(() => setCurrentTypeFilter(type))}
            selectedType={currentTypeFilter}
            allTypes={true}
            link={false}
          />
        </SectionCard>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-y-4 text-primary">
        <h2 className="text-xl font-bold">
          National Dex{' '}
          {currentGenFilter !== 'all' && (
            <span className="text-subtle text-lg">Gen {currentGenFilter}</span>
          )}
        </h2>
        <FilterOptions
          currentFilter={currentGenFilter}
          options={generationFilterOptions}
          onFilterChange={(gen) => startTransition(() => setCurrentGenFilter(gen))}
        />
      </div>

      <div className={clsx('flex flex-col gap-1 transition-opacity duration-200', isPending && 'opacity-50')}>
        <Suspense fallback={<PokedexSkeleton />}>
          <PokedexContent genFilter={currentGenFilter} typeFilter={currentTypeFilter} />
        </Suspense>
      </div>
    </PageContent>
  );
};

export default PokedexSelectionPage;
