import { NextPage } from 'next';
import SectionCard from '~/components/ui/SectionCard';
import { TypeBadge } from '~/components/ui/TypeBadge';
import { trpc } from '~/utils/trpc';
import LoadingPage from '~/components/ui/LoadingPage';

const TypesPage: NextPage = () => {
  const { data: types, isLoading } = trpc.pokemon.allTypes.useQuery();
  if (isLoading || !types) {
    return <LoadingPage />;
  }
  return (
    <SectionCard title="Pokémon Types">
      <div className="flex flex-wrap gap-4 justify-center">
        {types.map((type) => (
          <TypeBadge key={type.id} type={type} />
        ))}
      </div>
    </SectionCard>
  );
};

export default TypesPage;
