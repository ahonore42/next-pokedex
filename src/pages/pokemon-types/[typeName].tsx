import { useRouter } from 'next/router';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { usePageLoading } from '~/components/layout/DefaultLayout';
import { TypeMoveData } from '~/server/routers/_app';
import DataTable, {
  moveColumns,
  MoveColumns,
  MoveTableRow,
  pokemonColumns,
} from '~/components/ui/tables';
import TabView from '~/components/ui/TabView';
import PageHeading from '~/components/layout/PageHeading';
import { capitalizeName } from '~/utils/text';
import PageContent from '~/components/layout/PageContent';
import { getRgba, getTypeColor } from '~/utils';
import TypesDisplay from '~/components/pokemon-types/TypesDisplay';
import { PokemonListData } from '~/lib/types';

const PokemonTypeDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { typeName } = router.query;

  const { data, isLoading } = trpc.types.getTypeWithPokemonAndMoves.useQuery(
    { typeName: typeName as string },
    {
      enabled: !!typeName && typeof typeName === 'string',
    },
  );

  const isPageLoading = isLoading || !data?.type || !data?.pokemon?.length || !data?.moves?.length;
  usePageLoading(isPageLoading);
  if (isPageLoading) {
    return null;
  }
  const { type, pokemon, moves } = data;

  const pokemonData: PokemonListData[] = pokemon.map((pkmn) => {
    return {
      pokemonId: pkmn.id,
      speciesId: pkmn.pokemonSpeciesId,
      name: pkmn.name,
      genderRate: -1,
      sprites: { frontDefault: pkmn.sprites?.frontDefault, frontShiny: pkmn.sprites?.frontShiny },
      types: pkmn.types.map((t) => t.type.name),
      abilities: pkmn.abilities,
      stats: pkmn.stats,
    };
  });

  // Transform moves into 2-row data structure
  const createMoveRows = (moves: TypeMoveData[]) => {
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
      // Main row with move stats
      rows.push({
        moveId: move.id,
        rowType: 'main',
        move: formattedMove,
      });

      // Description row
      rows.push({
        moveId: move.id,
        rowType: 'description',
        move: formattedMove,
      });
    });

    return rows;
  };

  const moveRows = createMoveRows(moves || []);
  const hexColor = getTypeColor(type.name);
  const bgOverlay = getRgba(hexColor, 0.1);
  const formattedName = capitalizeName(type.name);
  return (
    <>
      <PageHeading
        pageTitle={`${formattedName} Type - Pokémon and Moves`}
        subtitle={`Pokémon and Moves`}
        metaDescription={`${formattedName} type Pokémon and moves`}
        schemaType="WebPage"
        breadcrumbLinks={[
          { label: 'Home', href: '/' },
          { label: 'Pokémon Types', href: '/pokemon-types' },
        ]}
        currentPage={`${formattedName}`}
        title={`${formattedName} Type`}
      />

      <PageContent>
        <TypesDisplay link />
        <div className="rounded-lg">
          <TabView
            tabs={[
              {
                label: 'Pokémon',
                content: (
                  <div
                    className="shadow-lg rounded-lg overflow-hidden"
                    style={{ backgroundColor: bgOverlay }}
                  >
                    <DataTable
                      data={pokemonData}
                      columns={pokemonColumns}
                      border
                      rounded
                      layoutStabilization={{
                        enabled: true,
                        fixedLayout: true, // Prevents column width recalculation
                        minColumnWidth: 'min-w-16', // Minimum width to prevent squashing
                        preCalculatedWidths: [
                          'w-16',
                          'w-40',
                          'w-24',
                          'w-40',
                          'w-16',
                          'w-16',
                          'w-16',
                          'w-18',
                          'w-18',
                          'w-18',
                          'w-18',
                        ], // Optional: specific widths per column
                      }}
                      virtualScroll={{
                        enabled: true,
                        rowHeight: 65,
                        overscan: 10,
                        threshold: 100,
                      }}
                    />
                  </div>
                ),
                badge: pokemon.length,
              },
              {
                label: 'Moves',
                content: (
                  <div
                    className="shadow-lg rounded-lg overflow-hidden"
                    style={{ backgroundColor: bgOverlay }}
                  >
                    <DataTable data={moveRows} columns={moveColumns} border rounded />
                  </div>
                ),
                badge: moves.length,
              },
            ]}
            initialTab="Pokémon"
            containerHeight="h-full"
          />
        </div>
      </PageContent>
    </>
  );
};

export default PokemonTypeDetailPage;
