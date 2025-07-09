import { NextPage } from 'next';
import SectionCard from '~/components/ui/SectionCard';
import { trpc } from '~/utils/trpc';
import { useRouter } from 'next/router';
import LoadingPage from '~/components/ui/LoadingPage';
import { capitalizeName } from '~/utils/pokemon';

const PokedexSelectionPage: NextPage = () => {
  const router = useRouter();
  const { data: pokedexes, isLoading } = trpc.pokemon.allPokedexes.useQuery();

  const handlePokedexChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const pokedexName = event.target.value;
    if (pokedexName) {
      router.push(`/pokedex/${pokedexName}`);
    }
  };

  if (isLoading || !pokedexes) {
    return <LoadingPage />;
  }

  const nationalDex = pokedexes.find(p => p.name === 'national');
  const regionalPokedexes = pokedexes
    .filter(p => p.name !== 'national')
    .reduce((acc, pokedex) => {
    const regionName = pokedex.region?.name ?? 'Other Dexes';
    if (!acc[regionName]) {
      acc[regionName] = [];
    }
    acc[regionName].push(pokedex);
    return acc;
  }, {} as Record<string, typeof pokedexes>);

  return (
    <SectionCard title="Select a Pokédex">
      <div className="flex flex-col items-center space-y-4">
        <p className="text-lg text-secondary">Choose a Pokédex to browse:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nationalDex && (
            <div>
              <h2 className="text-xl font-bold mb-2">National Dex</h2>
              <select
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                onChange={handlePokedexChange}
                defaultValue=""
              >
                <option value="" disabled>
                  Select a Pokédex
                </option>
                <option key={nationalDex.id} value={nationalDex.name.toLowerCase()}>
                  {nationalDex.names[0].name || nationalDex.name}
                </option>
              </select>
            </div>
          )}
          {regionalPokedexes && Object.entries(regionalPokedexes).map(([regionName, dexes]) => (
            <div key={regionName}>
              <h2 className="text-xl font-bold mb-2">{capitalizeName(regionName)}</h2>
              <select
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                onChange={handlePokedexChange}
                defaultValue=""
              >
                <option value="" disabled>
                  Select a Pokédex
                </option>
                {dexes.map((pokedex) => (
                  <option key={pokedex.id} value={pokedex.name.toLowerCase()}>
                    {pokedex.names[0].name || pokedex.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
};

export default PokedexSelectionPage;
