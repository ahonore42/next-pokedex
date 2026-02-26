import { useRouter } from 'next/router';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { usePageLoading } from '~/components/layout/DefaultLayout';
import DataTable, { pokemonColumns } from '~/components/ui/tables';
import SectionCard from '~/components/ui/SectionCard';
import PageHeading from '~/components/layout/PageHeading';
import PageContent from '~/components/layout/PageContent';
import TypeBadge from '~/components/pokemon-types/TypeBadge';
import MoveTypeBadge from '~/components/ui/MoveTypeBadge';
import { capitalizeName } from '~/utils/text';
import { PokemonListData } from '~/lib/types';

const MoveDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { move: moveName } = router.query;

  const { data, isLoading } = trpc.moves.byName.useQuery(
    { name: moveName as string },
    { enabled: !!moveName && typeof moveName === 'string', staleTime: 60_000 },
  );

  const isPageLoading = isLoading || !data;
  usePageLoading(isPageLoading);
  if (isPageLoading) return null;

  const { move, pokemon } = data;

  const displayName = move.names[0]?.name ?? capitalizeName(move.name);

  const tm = move.machines
    ?.filter((m) => m.item.name.startsWith('tm') || m.item.name.startsWith('hm'))
    .sort((a, b) => (b.versionGroup?.order || 0) - (a.versionGroup?.order || 0))
    .map((m) => m.item.name.toUpperCase())[0] ?? null;

  const description =
    move.flavorTexts[0]?.flavorText ||
    move.effectEntries[0]?.shortEffect ||
    'No description available';

  const pokemonData: PokemonListData[] = pokemon.map((pkmn) => ({
    pokemonId: pkmn.id,
    speciesId: pkmn.pokemonSpeciesId,
    name: pkmn.name,
    genderRate: -1,
    sprites: { frontDefault: pkmn.sprites?.frontDefault, frontShiny: pkmn.sprites?.frontShiny },
    types: pkmn.types.map((t) => t.type.name),
    abilities: pkmn.abilities,
    stats: pkmn.stats,
  }));


  return (
    <>
      <PageHeading
        pageTitle={`${displayName} - Pokémon Move`}
        metaDescription={`Details for the ${displayName} move: power, accuracy, PP, and Pokémon that can learn it.`}
        schemaType="WebPage"
        breadcrumbLinks={[
          { label: 'Home', href: '/' },
          { label: 'Moves', href: '/moves' },
        ]}
        currentPage={displayName}
        title={displayName}
        subtitle="Move Details"
      />

      <PageContent>
        <SectionCard title="Move Info" variant="compact" colorVariant="transparent">
          <div className="flex items-center gap-3 mb-4">
            <TypeBadge type={move.type.name} link />
            <MoveTypeBadge damageClass={move.moveDamageClass.name} />
          </div>
          <div className="flex flex-row justify-around text-center gap-4">
            <div>
              <p className="text-xs text-subtle">Power</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{move.power ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-subtle">Accuracy</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{move.accuracy ? `${move.accuracy}%` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-subtle">PP</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{move.pp ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-subtle">Priority</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{move.priority}</p>
            </div>
            <div>
              <p className="text-xs text-subtle">Effect %</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{move.effectChance ? `${move.effectChance}%` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-subtle">TM</p>
              <p className="text-xl font-bold text-primary">{tm ?? '—'}</p>
            </div>
          </div>
          {description && (
            <p className="mt-4 text-sm text-subtle">{description}</p>
          )}
        </SectionCard>

        <SectionCard
          title={`Learnable by ${pokemon.length} Pokémon`}
          variant="compact"
          colorVariant="transparent"
        >
          <DataTable
            data={pokemonData}
            columns={pokemonColumns}
            border
            rounded
            virtualScroll={{ enabled: false, rowHeight: 0 }}
          />
        </SectionCard>
      </PageContent>
    </>
  );
};

export default MoveDetailPage;
