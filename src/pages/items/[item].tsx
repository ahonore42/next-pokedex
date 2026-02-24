import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import SectionCard from '~/components/ui/SectionCard';
import PageHeading from '~/components/layout/PageHeading';
import PageContent from '~/components/layout/PageContent';
import { capitalizeName } from '~/utils/text';

const TEACHES_RE = /^(Teaches )(.+?)( to a compatible)/;

function renderEffectText(text: string) {
  const match = TEACHES_RE.exec(text);
  if (!match) return <>{text}</>;
  const [, prefix, moveName, suffix] = match;
  const rest = text.slice(match[0].length);
  const moveSlug = moveName.toLowerCase().replace(/\s+/g, '-');
  return (
    <>
      {prefix}
      <Link href={`/moves/${moveSlug}`} className="text-brand hover:text-brand-hover font-medium">
        {moveName}
      </Link>
      {suffix}{rest}
    </>
  );
}

const genDisplayName = (genName: string) =>
  `Gen ${genName.replace('generation-', '').toUpperCase()}`;

const versionGroupLabel = (versions: { name: string; names: { name: string }[] }[]) =>
  versions.map((v) => v.names[0]?.name ?? capitalizeName(v.name)).join(' / ');

type PokemonHeld = {
  pokemonId: number;
  pokemonName: string;
  slug: string;
  rarity: number;
  sprite: string | null;
};

const buildHeldByMap = (
  pokemonItems: {
    rarity: number;
    version: { id: number };
    pokemon: { id: number; name: string; sprites: { frontDefault: string | null } | null };
  }[],
): Map<number, PokemonHeld[]> => {
  const map = new Map<number, PokemonHeld[]>();
  for (const pi of pokemonItems) {
    const entry: PokemonHeld = {
      pokemonId: pi.pokemon.id,
      pokemonName: capitalizeName(pi.pokemon.name),
      slug: pi.pokemon.name,
      rarity: pi.rarity,
      sprite: pi.pokemon.sprites?.frontDefault ?? null,
    };
    const existing = map.get(pi.version.id) ?? [];
    if (!existing.some((e) => e.pokemonId === pi.pokemon.id)) {
      existing.push(entry);
    }
    map.set(pi.version.id, existing);
  }
  return map;
};

const getHeldByForVersionGroup = (
  versions: { id: number }[],
  heldByMap: Map<number, PokemonHeld[]>,
): PokemonHeld[] => {
  const versionIds = new Set(versions.map((v) => v.id));
  const seen = new Set<number>();
  const result: PokemonHeld[] = [];
  for (const [versionId, entries] of heldByMap) {
    if (!versionIds.has(versionId)) continue;
    for (const entry of entries) {
      if (!seen.has(entry.pokemonId)) {
        seen.add(entry.pokemonId);
        result.push(entry);
      }
    }
  }
  return result.sort((a, b) => a.pokemonId - b.pokemonId);
};

const ItemDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { item: itemName } = router.query;

  const { data: item, isLoading } = trpc.items.byName.useQuery(
    { name: itemName as string },
    { enabled: !!itemName && typeof itemName === 'string', staleTime: 60_000 },
  );

  if (isLoading || !item) return null;

  const displayName = item.names[0]?.name ?? capitalizeName(item.name);
  const categoryName = item.itemCategory.names[0]?.name ?? capitalizeName(item.itemCategory.name);
  const pocketName = item.itemCategory.pocket.names[0]?.name ?? capitalizeName(item.itemCategory.pocket.name);
  const shortEffect = item.effectTexts[0]?.shortEffect;
  const fullEffect = item.effectTexts[0]?.effect;
  const heldByMap = buildHeldByMap(item.pokemonItems);
  const hasLocations = item.pokemonItems.length > 0;

  return (
    <>
      <PageHeading
        pageTitle={`${displayName} - Pokémon Item`}
        metaDescription={`Details for the ${displayName} item: cost, effect, and game appearances.`}
        schemaType="WebPage"
        breadcrumbLinks={[
          { label: 'Home', href: '/' },
          { label: 'Items', href: '/items' },
        ]}
        currentPage={displayName}
        title={displayName}
        subtitle="Item Details"
      />

      <PageContent>
        <SectionCard title="Item Info" variant="compact" colorVariant="transparent">
          <div className="flex items-center gap-4 mb-4">
            {item.sprite && (
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={item.sprite}
                  alt={displayName}
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <p className="text-xs text-subtle capitalize">
                {pocketName} › {categoryName}
              </p>
            </div>
          </div>

          <div className="flex flex-row justify-around text-center gap-4">
            <div>
              <p className="text-xs text-subtle">Cost</p>
              <p className="text-xl font-bold text-primary">
                {item.cost > 0 ? `₽${item.cost.toLocaleString()}` : 'Free'}
              </p>
            </div>
            {item.flingPower != null && (
              <div>
                <p className="text-xs text-subtle">Fling Power</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{item.flingPower}</p>
              </div>
            )}
          </div>

          {(shortEffect || fullEffect) && (
            <div className="mt-4 space-y-2 text-sm text-subtle">
              {shortEffect && <p>{renderEffectText(shortEffect)}</p>}
              {fullEffect && fullEffect !== shortEffect && (
                <p className="italic">{renderEffectText(fullEffect)}</p>
              )}
            </div>
          )}
        </SectionCard>

        {item.flavorTexts.length > 0 && (
          <SectionCard title="Game Appearances" variant="compact" colorVariant="transparent">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold text-subtle whitespace-nowrap">
                      Game(s)
                    </th>
                    <th className="text-left py-2 pr-4 font-semibold text-subtle whitespace-nowrap">
                      Generation
                    </th>
                    {hasLocations && (
                      <th className="text-left py-2 pr-4 font-semibold text-subtle whitespace-nowrap">
                        Held by
                      </th>
                    )}
                    <th className="text-left py-2 font-semibold text-subtle">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {item.flavorTexts.map((ft, i) => {
                    const heldBy = hasLocations
                      ? getHeldByForVersionGroup(ft.versionGroup.versions, heldByMap)
                      : [];
                    return (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-2 pr-4 font-medium text-primary whitespace-nowrap align-top">
                          {versionGroupLabel(ft.versionGroup.versions)}
                        </td>
                        <td className="py-2 pr-4 text-subtle whitespace-nowrap align-top">
                          {genDisplayName(ft.versionGroup.generation.name)}
                        </td>
                        {hasLocations && (
                          <td className="py-2 pr-4 align-top">
                            {heldBy.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {heldBy.map((h) => (
                                  <Link
                                    key={h.pokemonId}
                                    href={`/pokemon/${h.slug}`}
                                    className="flex items-center gap-1 text-link hover:underline whitespace-nowrap"
                                  >
                                    {h.sprite && (
                                      <div className="relative w-6 h-6 flex-shrink-0">
                                        <Image
                                          src={h.sprite}
                                          alt={h.pokemonName}
                                          fill
                                          sizes="24px"
                                          className="object-contain"
                                        />
                                      </div>
                                    )}
                                    <span>{h.pokemonName}</span>
                                    <span className="text-xs text-subtle ml-1">({h.rarity}%)</span>
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <span className="text-subtle text-xs">—</span>
                            )}
                          </td>
                        )}
                        <td className="py-2 text-subtle align-top">{ft.flavorText}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </PageContent>
    </>
  );
};

export default ItemDetailPage;
