import { useState, Suspense, useTransition } from 'react';
import clsx from 'clsx';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { ItemListItem } from '~/server/routers/_app';
import DataTable, { itemColumns, ItemColumns, ItemTableRow } from '~/components/ui/tables';
import Badge from '~/components/ui/Badge';
import SectionCard from '~/components/ui/SectionCard';
import PageHeading from '~/components/layout/PageHeading';
import PageContent from '~/components/layout/PageContent';
import { capitalizeName } from '~/utils/text';
import SkeletonTableRow from '~/components/ui/skeletons/SkeletonTableRow';

const createItemRows = (items: ItemListItem[]): ItemTableRow[] => {
  const rows: ItemTableRow[] = [];

  items.forEach((item) => {
    const formatted: ItemColumns = {
      name: item.names[0]?.name ?? item.name,
      slug: item.name,
      category: item.itemCategory.names[0]?.name ?? item.itemCategory.name,
      cost: item.cost,
      generationId: item.generationId,
      effectText: item.effectTexts[0]?.shortEffect ?? '',
      description: item.flavorTexts[0]?.flavorText ?? '',
      sprite: item.sprite,
    };

    rows.push({ itemId: item.id, rowType: 'main', item: formatted });
    rows.push({ itemId: item.id, rowType: 'description', item: formatted });
  });

  return rows;
};

type GroupedItems = {
  pocketId: number;
  pocketName: string;
  categories: {
    categoryId: number;
    categoryName: string;
    items: ItemListItem[];
  }[];
}[];

const groupByPocketAndCategory = (items: ItemListItem[]): GroupedItems => {
  const pocketMap = new Map<
    number,
    { pocketName: string; categoryMap: Map<number, { categoryName: string; items: ItemListItem[] }> }
  >();

  for (const item of items) {
    const pocket = item.itemCategory.pocket;
    const pocketId = pocket.id;
    const pocketName = pocket.names[0]?.name ?? capitalizeName(pocket.name);
    const categoryId = item.itemCategory.id;
    const categoryName = item.itemCategory.names[0]?.name ?? capitalizeName(item.itemCategory.name);

    if (!pocketMap.has(pocketId)) {
      pocketMap.set(pocketId, { pocketName, categoryMap: new Map() });
    }

    const pocketEntry = pocketMap.get(pocketId)!;
    if (!pocketEntry.categoryMap.has(categoryId)) {
      pocketEntry.categoryMap.set(categoryId, { categoryName, items: [] });
    }
    pocketEntry.categoryMap.get(categoryId)!.items.push(item);
  }

  return Array.from(pocketMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([pocketId, { pocketName, categoryMap }]) => ({
      pocketId,
      pocketName,
      categories: Array.from(categoryMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([categoryId, { categoryName, items }]) => ({ categoryId, categoryName, items })),
    }));
};

function ItemsTableSkeleton() {
  return (
    <div className="rounded-lg overflow-scroll border-2 border-border">
      <table className="table-fixed w-full border-collapse divide-y divide-border">
        <tbody>
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonTableRow key={i} columns={itemColumns} rowHeight={i % 2 === 0 ? 'h-12' : 'h-4'} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ItemsContentProps = { generationId?: number };

function ItemsContent({ generationId }: ItemsContentProps) {
  const [data] = trpc.items.list.useSuspenseQuery(
    { generationId },
    { staleTime: Infinity },
  );

  const grouped = groupByPocketAndCategory(data);

  return (
    <>
      {grouped.map((pocket) => (
        <div key={pocket.pocketId} className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4 border-b border-border pb-2">
            {pocket.pocketName}
          </h2>

          {pocket.categories.map((category) => (
            <div key={category.categoryId} className="mb-6">
              <h3 className="text-base font-semibold text-subtle mb-2 ml-1">
                {category.categoryName}
                <span className="ml-2 text-xs font-normal text-subtle opacity-70">
                  ({category.items.length})
                </span>
              </h3>
              <DataTable
                data={createItemRows(category.items)}
                columns={itemColumns}
                border
                rounded
                virtualScroll={{ enabled: false, rowHeight: 0 }}
              />
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

const ItemsPage: NextPageWithLayout = () => {
  const [selectedGen, setSelectedGen] = useState<number | 'all'>('all');
  const [isPending, startTransition] = useTransition();

  const { data: generations } = trpc.items.generations.useQuery(undefined, {
    staleTime: Infinity,
  });

  return (
    <>
      <PageHeading
        pageTitle="Pokémon Items - Complete Item List"
        metaDescription="Browse all Pokémon items. View descriptions, costs, and categories for every item."
        schemaType="WebPage"
        breadcrumbLinks={[{ label: 'Home', href: '/' }]}
        currentPage="Items"
        title="Items"
        subtitle="All Pokémon Items"
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
          <Suspense fallback={<ItemsTableSkeleton />}>
            <ItemsContent
              generationId={selectedGen !== 'all' ? selectedGen : undefined}
            />
          </Suspense>
        </div>
      </PageContent>
    </>
  );
};

export default ItemsPage;
