import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { usePageLoading } from '~/lib/contexts/LoadingContext';
import SectionCard from '~/components/ui/SectionCard';
import PageHeading from '~/components/layout/PageHeading';
import PokedexDisplay from '~/components/pokemon/PokedexDisplay';
import { starterIds } from '~/utils/pokemon';
import InteractiveLink from '~/components/ui/InteractiveLink';

const PokedexSelectionPage: NextPageWithLayout = () => {
  const generationsResponse = trpc.pokemon.pokedexByGeneration.useQuery();
  const { data, isLoading } = generationsResponse;

  // Use the usePageLoading hook to manage loading state
  const isPageLoading = isLoading || !data;
  usePageLoading(isPageLoading);

  // Early return for loading state - DefaultLayout will handle showing loading spinner
  if (isPageLoading || !data?.national) {
    return null;
  }

  const { national, generations } = data;

  return (
    <>
      <PageHeading
        pageTitle="Pokédex Selection - Choose Your Region"
        metaDescription="Select from National and regional Pokédexes to explore Pokémon from different games and regions. Complete directory of all available Pokédexes."
        ogImage="/pokedex-selection-preview.png"
        schemaType="WebPage"
        breadcrumbLinks={[{ label: 'Home', href: '/' }]}
        currentPage="Pokédex Selection"
        title="Pokédex Selection"
        subtitle="Choose your region and version to explore"
      />

      <SectionCard title="Select a Pokédex" className="mb-8">
        <div className="flex flex-col items-center space-y-8">
          {/* Generation Pokemon Data Display */}
          <div className="w-full">
            <h2 className="text-xl font-bold text-center mb-6">Pokémon by Generation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {generations.map((generation) => {
                const starters = starterIds[generation.id].flatMap((id) =>
                  generation.pokemonSpecies.filter((s) => s.id === id),
                );
                return (
                  <InteractiveLink
                    key={generation.id}
                    href={`/pokedex/${generation.id}`}
                    ariaLabel={`Gen ${generation.id} Pokédex`}
                  >
                    <div key={generation.id} className="space-y-4 theme-transition text-primary">
                      <h3 className="text-lg font-semibold capitalize text-center border-b pb-2">
                        Gen {generation.id} Pokédex
                      </h3>

                      <div className="text-center">
                        <p className="text-sm text-secondary mb-2">
                          {generation.pokemonSpecies.length} Original Species
                        </p>
                        {/* Show first few Pokemon from this generation */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {starters.map((species) => (
                            <div
                              key={species.id}
                              className="p-2 border border-border rounded-md bg-secondary"
                            >
                              <img
                                src={species.pokemon[0]?.sprites?.frontDefault || ''}
                                alt={species.name}
                                className="w-12 h-12 mx-auto"
                              />
                              <p className="text-xs capitalize truncate">{species.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </InteractiveLink>
                );
              })}
            </div>
          </div>
        </div>
      </SectionCard>
      {/* National Pokédex - Featured prominently */}
      <h2 className="text-2xl font-bold mb-4">National Pokédex</h2>
      <p className="text-sm text-secondary mt-2">Complete directory of all Pokémon</p>
      <PokedexDisplay pokedex={national} />
    </>
  );
};

export default PokedexSelectionPage;
