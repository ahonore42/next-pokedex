import { useRouter } from 'next/router';
import Link from 'next/link';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { PokemonByTypeOutput, MovesByTypeOutput } from '~/server/routers/_app';
import { Column } from '~/components/ui/DataTable';
import SectionCard from '~/components/ui/SectionCard';
import TypeBadge from '~/components/pokemon-types/TypeBadge';
import DataTable from '~/components/ui/DataTable';
import MoveTypeBadge from '~/components/ui/MoveTypeBadge';
import TabView from '~/components/ui/TabView';

const PokemonTypeDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { typeName } = router.query;

  const { data: typeDetails, isLoading: isLoadingTypeDetails } = trpc.types.allTypes.useQuery(
    undefined,
    {
      select: (data) => data.find((type) => type.name === typeName),
      enabled: !!typeName,
    },
  );

  const { data: pokemonOfType, isLoading: isLoadingPokemonOfType } =
    trpc.types.getPokemonByType.useQuery(
      { typeId: typeDetails?.id ?? 0 },
      { enabled: !!typeDetails },
    ) as { data: PokemonByTypeOutput; isLoading: boolean };

  const { data: movesOfType, isLoading: isLoadingMovesOfType } = trpc.types.getMovesByType.useQuery(
    { typeId: typeDetails?.id ?? 0 },
    { enabled: !!typeDetails },
  ) as { data: MovesByTypeOutput; isLoading: boolean };

  // Use Column with the new type
  const pokemonColumns: Column<PokemonByTypeOutput[number]>[] = [
    {
      header: 'No.',
      accessor: (row) => row.pokemonSpecies.pokedexNumbers[0]?.pokedexNumber || '—',
      className: 'font-medium',
      sortable: true, // Add sortable
      sortKey: (row) => row.pokemonSpecies.pokedexNumbers[0]?.pokedexNumber || 0, // Add sortKey
    },
    {
      header: 'Pokémon',
      accessor: (row) => (
        <Link href={`/pokemon/${row.id}`} className="flex items-center gap-2 hover:underline">
          <img src={row.sprites?.frontDefault ?? ''} alt={row.name} className="w-10 h-10" />
          <span className="capitalize font-medium">{row.name}</span>
        </Link>
      ),
      sortable: true, // Add sortable
      sortKey: (row) => row.name, // Add sortKey
    },
    {
      header: 'Types',
      accessor: (row) => (
        <div className="flex gap-1">
          {row.types.map((t) => (
            <TypeBadge key={t.type.id} type={t.type} />
          ))}
        </div>
      ),
    },
    {
      header: 'Abilities',
      accessor: (row) => (
        <div className="flex flex-col gap-1">
          {row.abilities.map((t) => (
            <Link
              key={t.ability.name}
              href={`/abilities/${t.ability.name}`}
              className="flex items-center gap-2 hover:underline"
            >
              {t.ability.names[0]?.name || t.ability.name}
            </Link>
          ))}
        </div>
      ),
    },
    {
      header: 'HP',
      accessor: (row) => row.stats.find((stat) => stat.stat.name === 'hp')?.baseStat || '—',
      className: 'text-center',
      sortable: true, // Add sortable
      sortKey: (row) => row.stats.find((stat) => stat.stat.name === 'hp')?.baseStat || 0, // Add sortKey
    },
    {
      header: 'Attack',
      accessor: (row) => row.stats.find((stat) => stat.stat.name === 'attack')?.baseStat || '—',
      className: 'text-center',
      sortable: true, // Add sortable
      sortKey: (row) => row.stats.find((stat) => stat.stat.name === 'attack')?.baseStat || 0, // Add sortKey
    },
    {
      header: 'Defense',
      accessor: (row) => row.stats.find((stat) => stat.stat.name === 'defense')?.baseStat || '—',
      className: 'text-center',
      sortable: true, // Add sortable
      sortKey: (row) => row.stats.find((stat) => stat.stat.name === 'defense')?.baseStat || 0, // Add sortKey
    },
    {
      header: 'Sp. Atk',
      accessor: (row) =>
        row.stats.find((stat) => stat.stat.name === 'special-attack')?.baseStat || '—',
      className: 'text-center',
      sortable: true, // Add sortable
      sortKey: (row) =>
        row.stats.find((stat) => stat.stat.name === 'special-attack')?.baseStat || 0, // Add sortKey
    },
    {
      header: 'Sp. Def',
      accessor: (row) =>
        row.stats.find((stat) => stat.stat.name === 'special-defense')?.baseStat || '—',
      className: 'text-center',
      sortable: true, // Add sortable
      sortKey: (row) =>
        row.stats.find((stat) => stat.stat.name === 'special-defense')?.baseStat || 0, // Add sortKey
    },
    {
      header: 'Speed',
      accessor: (row) => row.stats.find((stat) => stat.stat.name === 'speed')?.baseStat || '—',
      className: 'text-center',
      sortable: true, // Add sortable
      sortKey: (row) => row.stats.find((stat) => stat.stat.name === 'speed')?.baseStat || 0, // Add sortKey
    },
    {
      header: 'Total',
      accessor: (row) => row.stats.reduce((sum, stat) => sum + stat.baseStat, 0),
      className: 'font-bold text-center',
      sortable: true, // Add sortable
      sortKey: (row) => row.stats.reduce((sum, stat) => sum + stat.baseStat, 0), // Add sortKey
    },
  ];

  const moveColumns = [
    {
      header: 'Move',
      accessor: (row: MovesByTypeOutput[number]) => row.name,
      className: 'font-medium capitalize',
      noWrap: false,
      sortable: true,
      sortKey: (row: MovesByTypeOutput[number]) => row.name,
    },
    {
      header: 'TM',
      accessor: (row: MovesByTypeOutput[number]) => {
        const latestTm = row.machines
          ?.filter(
            (machine) => machine.item.name.startsWith('tm') || machine.item.name.startsWith('hm'),
          )
          .sort((a, b) => (b.versionGroup?.order || 0) - (a.versionGroup?.order || 0))
          .map((machine) => machine.item.name.toUpperCase())[0];
        return latestTm || '—';
      },
      className: 'font-medium',
      noWrap: true,
      sortable: true,
      sortKey: (row: MovesByTypeOutput[number]) => {
        const latestTm = row.machines
          ?.filter(
            (machine) => machine.item.name.startsWith('tm') || machine.item.name.startsWith('hm'),
          )
          .sort((a, b) => (b.versionGroup?.order || 0) - (a.versionGroup?.order || 0))
          .map((machine) => machine.item.name.toUpperCase())[0];
        // Extract number from TM/HM string for sorting
        const tmNumber = latestTm ? parseInt(latestTm.replace(/[^0-9]/g, ''), 10) : 0;
        return tmNumber;
      },
    },
    {
      header: 'Type',
      accessor: (row: MovesByTypeOutput[number]) => <TypeBadge type={row.type} link={false} />,
      className: 'text-center',
      noWrap: true,
      sortable: true,
      sortKey: (row: MovesByTypeOutput[number]) => row.type.name,
    },
    {
      header: 'Category',
      accessor: (row: MovesByTypeOutput[number]) => (
        <MoveTypeBadge moveDamageClass={row.moveDamageClass} />
      ),
      className: 'text-center',
      noWrap: true,
      sortable: true,
      sortKey: (row: MovesByTypeOutput[number]) => row.moveDamageClass.name,
      filterOptions: ['physical', 'special', 'status'], // Add this
    },
    {
      header: 'Power',
      accessor: (row: MovesByTypeOutput[number]) => <>{row.power || '—'}</>,
      className: 'text-center',
      noWrap: true,
      sortable: true,
      sortKey: (row: MovesByTypeOutput[number]) => row.power || 0,
    },
    {
      header: 'Accuracy',
      accessor: (row: MovesByTypeOutput[number]) => <>{row.accuracy ? `${row.accuracy}%` : '—'}</>,
      className: 'text-center',
      noWrap: true,
      sortable: true,
      sortKey: (row: MovesByTypeOutput[number]) => row.accuracy || 0,
    },
    {
      header: 'PP',
      accessor: (row: MovesByTypeOutput[number]) => <>{row.pp || '—'}</>,
      className: 'text-center',
      noWrap: true,
      sortable: true,
      sortKey: (row: MovesByTypeOutput[number]) => row.pp || 0,
    },
    {
      header: 'Priority',
      accessor: (row: MovesByTypeOutput[number]) => <>{row.priority}</>,
      className: 'text-center',
      noWrap: true,
      sortable: true,
      sortKey: (row: MovesByTypeOutput[number]) => row.priority,
    },
    {
      header: 'Effect%',
      accessor: (row: MovesByTypeOutput[number]) => (
        <>{row.effectChance ? `${row.effectChance}%` : '—'}</>
      ),
      className: 'text-center',
      noWrap: true,
      sortable: true,
      sortKey: (row: MovesByTypeOutput[number]) => row.effectChance || 0,
    },
    {
      header: 'Description',
      accessor: (row: MovesByTypeOutput[number]) => (
        <>
          {row.effectEntries[0]?.shortEffect ||
            row.flavorTexts[0]?.flavorText ||
            'No description available'}
        </>
      ),
      className: 'max-w-xs text-sm text-gray-600 dark:text-gray-300',
      sortable: false,
    },
  ];

  const isPageLoading =
    isLoadingTypeDetails || isLoadingPokemonOfType || isLoadingMovesOfType || !typeDetails;
  if (isPageLoading) {
    return null; // Let DefaultLayout handle the loading display
  }

  return (
    <SectionCard className="capitalize" title={`${typeDetails.name} Type`}>
      <TabView
        tabs={[
          {
            label: 'Pokémon',
            content: (
              <div className="mb-8">
                {pokemonOfType && pokemonOfType.length > 0 ? (
                  <DataTable data={pokemonOfType} columns={pokemonColumns} initialSortBy="No." />
                ) : (
                  <p>No Pokémon found for this type.</p>
                )}
              </div>
            ),
          },
          {
            label: 'Moves',
            content: (
              <div>
                {movesOfType && movesOfType.length > 0 ? (
                  <DataTable data={movesOfType} columns={moveColumns} initialSortBy="Move" />
                ) : (
                  <p>No moves found for this type.</p>
                )}
              </div>
            ),
          },
        ]}
        initialTab="Pokémon"
      />
    </SectionCard>
  );
};

export default PokemonTypeDetailPage;
