import { trpc } from '~/utils/trpc';
import LoadingPage from '~/components/ui/LoadingPage';
import EvolutionFlow from '~/components/pokemon/EvolutionFlow';

const EvolutionTreesPage = () => {
  const { data, isLoading, error } = trpc.evolutionChains.all.useQuery();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // console.log('Evolution Chains Data:', data?.slice(0,10));

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">Pokemon Evolution Trees</h1>
      <div className="space-y-8 w-full">
        {data?.map((chain) => (
          <EvolutionFlow  key={chain.id} chain={chain} />
        ))}
      </div>
    </>
  );
};

export default EvolutionTreesPage;
