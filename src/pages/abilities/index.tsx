import { useState, Suspense, useTransition } from 'react';
import clsx from 'clsx';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { AbilityListItem } from '~/server/routers/_app';
import DataTable, { abilityColumns, AbilityColumns, AbilityTableRow } from '~/components/ui/tables';
import MetricsGrid from '~/components/ui/MetricsGrid';
import Badge from '~/components/ui/Badge';
import SectionCard from '~/components/ui/SectionCard';
import PageHeading from '~/components/layout/PageHeading';
import PageContent from '~/components/layout/PageContent';
import SkeletonTableRow from '~/components/ui/skeletons/SkeletonTableRow';

const createAbilityRows = (abilities: AbilityListItem[]): AbilityTableRow[] => {
  const rows: AbilityTableRow[] = [];

  abilities.forEach((ability) => {
    const formatted: AbilityColumns = {
      name: ability.names[0]?.name ?? ability.name,
      slug: ability.name,
      generationId: ability.generationId,
      description:
        ability.flavorTexts[0]?.flavorText ||
        ability.effectTexts[0]?.shortEffect ||
        'No description available',
      isMainSeries: ability.isMainSeries,
      pokemonCount: ability._count.pokemonAbilities,
    };

    rows.push({ abilityId: ability.id, rowType: 'main', ability: formatted });
    rows.push({ abilityId: ability.id, rowType: 'description', ability: formatted });
  });

  return rows;
};

function AbilitiesTableSkeleton() {
  return (
    <div className="rounded-lg overflow-scroll border-2 border-border">
      <table className="table-fixed w-full border-collapse divide-y divide-border">
        <tbody>
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonTableRow key={i} columns={abilityColumns} rowHeight={i % 2 === 0 ? 'h-5' : 'h-4'} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

type AbilitiesContentProps = { generationId?: number };

function AbilitiesContent({ generationId }: AbilitiesContentProps) {
  const [data] = trpc.abilities.list.useSuspenseQuery(
    { generationId },
    { staleTime: Infinity },
  );

  const abilityRows = createAbilityRows(data);

  const metrics = [
    { label: 'Total Abilities', value: data.length, color: 'primary' as const },
    {
      label: 'Main Series',
      value: data.filter((a) => a.isMainSeries).length,
      color: 'green' as const,
    },
    {
      label: 'Non-Main Series',
      value: data.filter((a) => !a.isMainSeries).length,
      color: 'yellow' as const,
    },
  ];

  return (
    <>
      <MetricsGrid metrics={metrics} columns={{ default: 2, sm: 3 }} />
      <DataTable
        data={abilityRows}
        columns={abilityColumns}
        border
        rounded
        virtualScroll={{ enabled: false, rowHeight: 0 }}
      />
    </>
  );
}

const AbilitiesPage: NextPageWithLayout = () => {
  const [selectedGen, setSelectedGen] = useState<number | 'all'>('all');
  const [isPending, startTransition] = useTransition();

  const { data: generations } = trpc.abilities.generations.useQuery(undefined, {
    staleTime: Infinity,
  });

  return (
    <>
      <PageHeading
        pageTitle="Pokémon Abilities - Complete Ability List"
        metaDescription="Browse all Pokémon abilities by generation. View descriptions and effects for every ability."
        schemaType="WebPage"
        breadcrumbLinks={[{ label: 'Home', href: '/' }]}
        currentPage="Abilities"
        title="Abilities"
        subtitle="All Pokémon Abilities"
      />

      <PageContent>
        <SectionCard title="Filter by Generation" variant="compact" colorVariant="transparent">
          <div className="flex flex-wrap justify-center items-center gap-2">
            <Badge
              className={selectedGen === 'all' ? 'bg-indigo-600 dark:bg-indigo-700' : 'bg-slate-500 dark:bg-slate-600'}
              onClick={() => startTransition(() => setSelectedGen('all'))}
            >
              All
            </Badge>
            {generations?.map((gen) => (
              <Badge
                key={gen}
                className={selectedGen === gen ? 'bg-indigo-600 dark:bg-indigo-700' : 'bg-slate-500 dark:bg-slate-600'}
                onClick={() => startTransition(() => setSelectedGen(gen))}
              >
                {`Gen ${gen}`}
              </Badge>
            ))}
          </div>
        </SectionCard>

        <div className={clsx('transition-opacity duration-200', isPending && 'opacity-50')}>
          <Suspense fallback={<AbilitiesTableSkeleton />}>
            <AbilitiesContent
              generationId={selectedGen !== 'all' ? selectedGen : undefined}
            />
          </Suspense>
        </div>
      </PageContent>
    </>
  );
};

export default AbilitiesPage;
