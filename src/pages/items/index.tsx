import { useState } from 'react';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { usePageLoading } from '~/components/layout/DefaultLayout';
import { ItemListItem } from '~/server/routers/_app';
import DataTable, { itemColumns, ItemColumns, ItemTableRow } from '~/components/ui/tables';
import Badge from '~/components/ui/Badge';
import SectionCard from '~/components/ui/SectionCard';
import PageHeading from '~/components/layout/PageHeading';
import PageContent from '~/components/layout/PageContent';
import { capitalizeName } from '~/utils/text';

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

const ItemsPage: NextPageWithLayout = () => {
  const [selectedGen, setSelectedGen] = useState<number | 'all'>('all');

  const { data: generations } = trpc.items.generations.useQuery(undefined, {
    staleTime: Infinity,
  });

  const { data, isLoading } = trpc.items.list.useQuery(
    { generationId: selectedGen !== 'all' ? selectedGen : undefined },
    { staleTime: 60_000 },
  );

  const isPageLoading = isLoading || !data || !generations;
  usePageLoading(isPageLoading);
  if (isPageLoading) return null;

  const grouped = groupByPocketAndCategory(data);

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
              onClick={() => setSelectedGen('all')}
            >
              All
            </Badge>
            {generations.map((gen) => (
              <Badge
                key={gen}
                className={selectedGen === gen ? 'bg-indigo-600 dark:bg-indigo-700' : 'bg-slate-500 dark:bg-slate-600'}
                onClick={() => setSelectedGen(gen)}
              >
                {`Gen ${gen}`}
              </Badge>
            ))}
          </div>
        </SectionCard>

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
      </PageContent>
    </>
  );
};

export default ItemsPage;
