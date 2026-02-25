import { useState } from 'react';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { LocationListItem } from '~/server/routers/_app';
import Badge from '~/components/ui/Badge';
import SectionCard from '~/components/ui/SectionCard';
import PageHeading from '~/components/layout/PageHeading';
import PageContent from '~/components/layout/PageContent';
import ExpandableCard from '~/components/ui/ExpandableCard';
import LocationEncounterDetail from '~/components/locations/LocationEncounterDetail';
import { capitalizeName } from '~/utils/text';

// Generation ID → region display name (matches Generation.mainRegionId ordering)
const REGION_NAMES: Record<number, string> = {
  1: 'Kanto',
  2: 'Johto',
  3: 'Hoenn',
  4: 'Sinnoh',
  5: 'Unova',
  6: 'Kalos',
  7: 'Alola',
  8: 'Galar',
  9: 'Hisui',
  10: 'Paldea',
};

type GroupedLocations = {
  regionId: number;
  regionName: string;
  locations: LocationListItem[];
}[];

const groupByRegion = (locations: LocationListItem[]): GroupedLocations => {
  const regionMap = new Map<number, LocationListItem[]>();

  for (const loc of locations) {
    if (loc.regionId == null) continue;
    const existing = regionMap.get(loc.regionId) ?? [];
    existing.push(loc);
    regionMap.set(loc.regionId, existing);
  }

  return Array.from(regionMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([regionId, locs]) => ({
      regionId,
      regionName: REGION_NAMES[regionId] ?? capitalizeName(String(regionId)),
      locations: locs,
    }));
};

// Individual location card with lazy-loaded encounter detail
function LocationCard({ location }: { location: LocationListItem }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: detail, isLoading } = trpc.locations.byName.useQuery(location.name, {
    enabled: isExpanded,
    staleTime: Infinity,
  });

  const name = location.names[0]?.name ?? capitalizeName(location.name);
  const totalEncounters = location.areas.reduce((sum, a) => sum + a._count.pokemonEncounters, 0);
  const tag =
    totalEncounters > 0
      ? `${totalEncounters} encounter${totalEncounters !== 1 ? 's' : ''}`
      : 'No encounters';

  return (
    <ExpandableCard
      title={name}
      tag={tag}
      variant="compact"
      onToggle={setIsExpanded}
      disabled={totalEncounters === 0}
    >
      {isLoading && (
        <p className="text-sm text-subtle italic py-2">Loading encounter data…</p>
      )}
      {detail && <LocationEncounterDetail location={detail} />}
    </ExpandableCard>
  );
}

const LocationsPage: NextPageWithLayout = () => {
  const [selectedGen, setSelectedGen] = useState<number | 'all'>('all');

  const { data: generations } = trpc.locations.generations.useQuery(undefined, {
    staleTime: Infinity,
  });

  const { data, isLoading } = trpc.locations.list.useQuery(
    { generationId: selectedGen !== 'all' ? selectedGen : undefined },
    { staleTime: 60_000 },
  );

  if (isLoading || !data || !generations) return null;

  const grouped = groupByRegion(data);

  return (
    <>
      <PageHeading
        pageTitle="Pokémon Locations - Complete Location Guide"
        metaDescription="Browse all Pokémon locations by region and generation. Find Pokémon encounter areas for every game."
        schemaType="WebPage"
        breadcrumbLinks={[{ label: 'Home', href: '/' }]}
        currentPage="Locations"
        title="Locations"
        subtitle="All Pokémon Locations"
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
                key={gen.id}
                className={selectedGen === gen.id ? 'bg-indigo-600 dark:bg-indigo-700' : 'bg-slate-500 dark:bg-slate-600'}
                onClick={() => setSelectedGen(gen.id)}
              >
                {`Gen ${gen.id}`}
              </Badge>
            ))}
          </div>
        </SectionCard>

        {grouped.map((region) => (
          <div key={region.regionId} className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4 border-b border-border pb-2">
              {region.regionName}
              <span className="ml-3 text-sm font-normal text-subtle opacity-70">
                ({region.locations.length} locations)
              </span>
            </h2>
            <div className="space-y-2">
              {region.locations.map((loc) => (
                <LocationCard key={loc.id} location={loc} />
              ))}
            </div>
          </div>
        ))}
      </PageContent>
    </>
  );
};

export default LocationsPage;
