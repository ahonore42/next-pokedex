import { NextPage } from 'next';
import SectionCard from '~/components/ui/SectionCard';
import { TypeBadge } from '~/components/ui/TypeBadge';
import { trpc } from '~/utils/trpc';
import LoadingPage from '~/components/ui/LoadingPage';
import TypeEffectivenessChart from '~/components/pokemon/TypeEffectivenessChart';

const TypesPage: NextPage = () => {
  const { data: types, isLoading } = trpc.types.allTypes.useQuery();

  if (isLoading || !types) {
    return <LoadingPage />;
  }
  return (
    <>
      <SectionCard title="Pokémon Types" className="mb-4">
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
