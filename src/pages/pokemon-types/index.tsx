import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { usePageLoading } from '~/lib/contexts/LoadingContext';
import SectionCard from '~/components/ui/SectionCard';
import TypeBadge from '~/components/pokemon-types/TypeBadge';
import TypeEffectivenessChart from '~/components/pokemon-types/TypeEffectivenessChart';

const TypesPage: NextPageWithLayout = () => {
  const { data: types, isLoading } = trpc.types.allTypes.useQuery();

  // Use the loading context instead of LoadingPage
  usePageLoading(isLoading || !types);

  if (isLoading || !types) {
    return null; // Let DefaultLayout handle the loading display
  }

  return (
    <>
      <SectionCard title="Pokémon Types" className="mb-8" colorVariant="transparent">
        <div className="flex flex-wrap gap-4 justify-center">
          {types.map((type) => (
            <TypeBadge key={type.id} type={type} />
          ))}
        </div>
      </SectionCard>

      <TypeEffectivenessChart />
    </>
  );
};

export default TypesPage;
