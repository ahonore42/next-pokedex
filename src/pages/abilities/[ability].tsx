import { useRouter } from 'next/router';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import DataTable, { pokemonColumns } from '~/components/ui/tables';
import SectionCard from '~/components/ui/SectionCard';
import PageHeading from '~/components/layout/PageHeading';
import PageContent from '~/components/layout/PageContent';
import { capitalizeName } from '~/utils/text';
import { PokemonListData } from '~/lib/types';

const AbilityDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { ability: abilityName } = router.query;

  const { data, isLoading } = trpc.abilities.byName.useQuery(
    { name: abilityName as string },
    { enabled: !!abilityName && typeof abilityName === 'string', staleTime: 60_000 },
  );

  if (isLoading || !data) return null;

  const { ability, pokemon } = data;

  const displayName = ability.names[0]?.name ?? capitalizeName(ability.name);

  const description =
    ability.flavorTexts[0]?.flavorText ||
    ability.effectTexts[0]?.shortEffect ||
    'No description available';

  const fullEffect = ability.effectTexts[0]?.effect;

  const pokemonData: PokemonListData[] = pokemon.map((pa) => ({
    pokemonId: pa.pokemon.id,
    speciesId: pa.pokemon.pokemonSpeciesId,
    name: pa.pokemon.name,
    sprites: { frontDefault: pa.pokemon.sprites?.frontDefault, frontShiny: pa.pokemon.sprites?.frontShiny },
    types: pa.pokemon.types.map((t) => t.type.name),
    abilities: pa.pokemon.abilities,
    stats: pa.pokemon.stats,
  }));


  return (
    <>
      <PageHeading
        pageTitle={`${displayName} - Pokémon Ability`}
        metaDescription={`Details for the ${displayName} ability and all Pokémon that can have it.`}
        schemaType="WebPage"
        breadcrumbLinks={[
          { label: 'Home', href: '/' },
          { label: 'Abilities', href: '/abilities' },
        ]}
        currentPage={displayName}
        title={displayName}
        subtitle="Ability Details"
      />

      <PageContent>
        <SectionCard title="Ability Info" variant="compact" colorVariant="transparent">
          <div className="flex flex-row justify-around text-center gap-4">
            <div>
              <p className="text-xs text-subtle">Generation</p>
              <p className="text-xl font-bold text-primary">Gen {ability.generationId}</p>
            </div>
            <div>
              <p className="text-xs text-subtle">Main Series</p>
              <p className={`text-xl font-bold ${ability.isMainSeries ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {ability.isMainSeries ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-xs text-subtle">Pokémon</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{pokemon.length}</p>
            </div>
          </div>
          {description && (
            <p className="mt-4 text-sm text-subtle italic">{description}</p>
          )}
          {fullEffect && (
            <p className="mt-2 text-sm text-primary">{fullEffect}</p>
          )}
        </SectionCard>

        <SectionCard
          title={`Found on ${pokemon.length} Pokémon`}
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

export default AbilityDetailPage;
