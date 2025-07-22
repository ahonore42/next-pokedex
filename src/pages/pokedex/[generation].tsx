import { useRouter } from 'next/router';
import { useState, useMemo } from 'react';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import SectionCard from '~/components/ui/SectionCard';
import PageHeading from '~/components/layout/PageHeading';
import PokedexDisplay from '~/components/pokemon/PokedexDisplay';

const PokedexGenerationPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { generation } = router.query;
  // State hooks
  const [selectedVersionGroupId, setSelectedVersionGroupId] = useState<number | null>(null);
  const [selectedPokedexId, setSelectedPokedexId] = useState<number | null>(null);

  // Query hook
  const generationId = typeof generation === 'string' ? parseInt(generation) : 0;
  const { data: generationData, isLoading } = trpc.pokemon.regionalPokedexesByGeneration.useQuery(
    { generationId },
    { enabled: !!generationId, staleTime: 5 * 60 * 1000 },
  );

  // Loading context
  const isPageLoading = isLoading || !generationData;

  // Memoised look-ups
  const versionGroupMap = useMemo(
    () => new Map(generationData?.versionGroups.map((vg) => [vg.id, vg])),
    [generationData],
  );

  const selectedVersionGroup = useMemo(
    () =>
      versionGroupMap.get(
        selectedVersionGroupId ??
          (generationData?.versionGroups.length ? generationData.versionGroups[0].id : 0),
      ),
    [selectedVersionGroupId, versionGroupMap, generationData],
  );

  const availablePokedexes = useMemo(
    () => selectedVersionGroup?.pokedexes.map((p) => p.pokedex) ?? [],
    [selectedVersionGroup],
  );

  const pokedexMap = useMemo(
    () => new Map(availablePokedexes.map((p) => [p.id, p])),
    [availablePokedexes],
  );

  const selectedPokedex = useMemo(
    () => pokedexMap.get(selectedPokedexId ?? availablePokedexes[0]?.id),
    [selectedPokedexId, pokedexMap, availablePokedexes],
  );

  const allRegions = useMemo(
    () =>
      Array.from(
        new Map(
          generationData?.versionGroups
            .flatMap((vg) => vg.pokedexes.map((p) => p.pokedex.region))
            .filter(Boolean)
            .map((r) => [r!.id, r]),
        ).values(),
      ) ?? [],
    [generationData],
  );

  if (isPageLoading) {
    return null; // Let DefaultLayout handle the loading display
  }

  if (!generationData.versionGroups.length) {
    return (
      <SectionCard title="No Data Found">
        <div className="text-center">
          <p className="text-lg text-secondary mb-4">
            No version group or Pokédex data found for generation {generation}.
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

  // Handle version group selection change
  const handleVersionGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const versionGroupId = parseInt(event.target.value);
    setSelectedVersionGroupId(versionGroupId || null);
    setSelectedPokedexId(null); // Reset pokedex selection when version group changes
  };

  // Handle pokedex selection change
  const handlePokedexChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const pokedexId = parseInt(event.target.value);
    setSelectedPokedexId(pokedexId || null);
  };

  return (
    <>
      <PageHeading
        pageTitle={`Generation ${generationId} Pokédex - Regional Pokémon Directory`}
        metaDescription={`Browse all Pokémon from Generation ${generationId}. Complete directory with detailed information for each Pokémon across different regions.`}
        ogImage={`/pokedex-generation-${generationId}-preview.png`}
        schemaType="WebPage"
        breadcrumbLinks={[
          { label: 'Home', href: '/' },
          { label: 'Pokédex Selection', href: '/pokedex' },
        ]}
        currentPage={`Generation ${generationId} Pokédex`}
        title={`Generation ${generationId} Pokédex`}
        subtitle={`${generationData.versionGroups.length} Version Group${generationData.versionGroups.length > 1 ? 's' : ''} Available`}
      />

      <SectionCard title={`Generation ${generationId} Pokédex`} className="mb-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">Generation {generationId} Pokédex</h2>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
              {generationData.versionGroups.length} Version Group
              {generationData.versionGroups.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Version Group Selector */}
            {generationData.versionGroups.length > 1 && (
              <div className="flex items-center space-x-2">
                <label htmlFor="version-group-select" className="text-sm font-medium">
                  Version Group:
                </label>
                <select
                  id="version-group-select"
                  className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={handleVersionGroupChange}
                  value={selectedVersionGroupId || generationData.versionGroups[0]?.id || ''}
                >
                  {generationData.versionGroups.map((versionGroup) => (
                    <option key={versionGroup.id} value={versionGroup.id}>
                      {versionGroup.name
                        .split('-')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Pokedex Selector */}
            {availablePokedexes.length > 1 && (
              <div className="flex items-center space-x-2">
                <label htmlFor="pokedex-select" className="text-sm font-medium">
                  Pokédex:
                </label>
                <select
                  id="pokedex-select"
                  className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={handlePokedexChange}
                  value={selectedPokedexId || availablePokedexes[0]?.id || ''}
                >
                  {availablePokedexes.map((pokedex) => (
                    <option key={pokedex.id} value={pokedex.id}>
                      {pokedex.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Back to Selection Button */}
            <button
              onClick={() => router.push('/pokedex')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ← Back to Selection
            </button>
          </div>
        </div>

        {/* Generation Info */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {generationData.versionGroups.length}
              </p>
              <p className="text-sm text-secondary">Version Groups</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {availablePokedexes.length}
              </p>
              <p className="text-sm text-secondary">Available Pokédexes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {allRegions.length}
              </p>
              <p className="text-sm text-secondary">Regions</p>
            </div>
          </div>
        </div>

        {/* Current Selection Info */}
        {selectedVersionGroup && selectedPokedex && (
          <div className="mb-4 text-center">
            <h3 className="text-lg font-semibold">
              Currently viewing:{' '}
              {selectedVersionGroup.name
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}{' '}
              - {selectedPokedex.name}
            </h3>
            {selectedPokedex.region && (
              <p className="text-sm text-secondary">
                Region:{' '}
                {selectedPokedex.region.name.charAt(0).toUpperCase() +
                  selectedPokedex.region.name.slice(1)}
              </p>
            )}
          </div>
        )}
      </SectionCard>
      {/* Pokémon Display */}
      {selectedPokedex && <PokedexDisplay pokedex={selectedPokedex} />}
    </>
  );
};

export default PokedexGenerationPage;
