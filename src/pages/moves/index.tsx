import { useState, Suspense, useTransition } from 'react';
import clsx from 'clsx';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { TypeMoveData } from '~/server/routers/_app';
import DataTable, { moveColumns, MoveColumns, MoveTableRow } from '~/components/ui/tables';
import TypeFilter from '~/components/pokemon-types/TypeFilter';
import MetricsGrid from '~/components/ui/MetricsGrid';
import Badge from '~/components/ui/Badge';
import SectionCard from '~/components/ui/SectionCard';
import PageHeading from '~/components/layout/PageHeading';
import PageContent from '~/components/layout/PageContent';
import SkeletonTableRow from '~/components/ui/skeletons/SkeletonTableRow';

const createMoveRows = (moves: TypeMoveData[]): MoveTableRow[] => {
  const rows: MoveTableRow[] = [];

  moves.forEach((move) => {
    const formattedMove: MoveColumns = {
      name: move.names[0].name,
      slug: move.name,
      type: move.type.name,
      damageClass: move.moveDamageClass.name,
      description:
        move.flavorTexts[0]?.flavorText ||
        move.effectEntries[0]?.shortEffect ||
        'No description available',
      machine: move.machines
        ?.filter(
          (machine) => machine.item.name.startsWith('tm') || machine.item.name.startsWith('hm'),
        )
        .sort((a, b) => (b.versionGroup?.order || 0) - (a.versionGroup?.order || 0))
        .map((machine) => machine.item.name.toUpperCase())[0],
      power: move.power,
      accuracy: move.accuracy,
      pp: move.pp,
      priority: move.priority,
      effectChance: move.effectChance,
    };

    rows.push({ moveId: move.id, rowType: 'main', move: formattedMove });
    rows.push({ moveId: move.id, rowType: 'description', move: formattedMove });
  });

  return rows;
};

const GENERATIONS = Array.from({ length: 9 }, (_, i) => i + 1);

// Skeleton fallback – mirrors the table structure using the actual column definitions
function MovesTableSkeleton() {
  return (
    <div className="rounded-lg overflow-scroll border-2 border-border">
      <table className="table-fixed w-full border-collapse divide-y divide-border">
        <tbody>
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonTableRow key={i} columns={moveColumns} rowHeight={i % 2 === 0 ? 'h-7' : 'h-4'} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Inner component – suspends until the query resolves
type MovesContentProps = { typeName?: string; generationId?: number };

function MovesContent({ typeName, generationId }: MovesContentProps) {
  const [data] = trpc.moves.list.useSuspenseQuery(
    { typeName, generationId },
    { staleTime: Infinity },
  );

  const moveRows = createMoveRows(data);

  const metrics = [
    { label: 'Total Moves', value: data.length, color: 'primary' as const },
    {
      label: 'Physical',
      value: data.filter((m) => m.moveDamageClass.name === 'physical').length,
      color: 'red' as const,
    },
    {
      label: 'Special',
      value: data.filter((m) => m.moveDamageClass.name === 'special').length,
      color: 'blue' as const,
    },
    {
      label: 'Status',
      value: data.filter((m) => m.moveDamageClass.name === 'status').length,
      color: 'purple' as const,
    },
  ];

  return (
    <>
      <MetricsGrid metrics={metrics} columns={{ default: 2, sm: 4 }} />
      <DataTable
        data={moveRows}
        columns={moveColumns}
        border
        rounded
        virtualScroll={{ enabled: false, rowHeight: 0 }}
      />
    </>
  );
}

const MovesPage: NextPageWithLayout = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedGen, setSelectedGen] = useState<number | 'all'>('all');
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <PageHeading
        pageTitle="Pokémon Moves - Complete Move List"
        metaDescription="Browse all Pokémon moves filtered by type. View power, accuracy, PP, and more."
        schemaType="WebPage"
        breadcrumbLinks={[{ label: 'Home', href: '/' }]}
        currentPage="Moves"
        title="Moves"
        subtitle="All Pokémon Moves"
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
            {GENERATIONS.map((gen) => (
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
        <SectionCard title="Filter by Type" variant="compact" colorVariant="transparent">
          <TypeFilter
            selectedType={selectedType}
            onTypeChange={(type) => startTransition(() => setSelectedType(type))}
          />
        </SectionCard>

        <div className={clsx('transition-opacity duration-200', isPending && 'opacity-50')}>
          <Suspense fallback={<MovesTableSkeleton />}>
            <MovesContent
              typeName={selectedType ?? undefined}
              generationId={selectedGen !== 'all' ? selectedGen : undefined}
            />
          </Suspense>
        </div>
      </PageContent>
    </>
  );
};

export default MovesPage;
