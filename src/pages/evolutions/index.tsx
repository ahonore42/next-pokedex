import { trpc } from '~/utils/trpc';
import LoadingPage from '~/components/ui/LoadingPage';
import EvolutionChain from '~/components/pokemon/EvolutionChain';
import { InfiniteScroll } from '~/components/ui/InfiniteScroll';
import type { EvolutionChainsPaginatedOutput } from '~/server/routers/_app';

const EvolutionTreesPage = () => {
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, error } =
    trpc.evolutionChains.paginated.useInfiniteQuery(
      {
        limit: 20,
      },
      {
        getNextPageParam: (lastPage: EvolutionChainsPaginatedOutput) => lastPage.nextCursor,
      },
    );

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const allChains = data?.pages.flatMap((page) => page.chains) ?? [];

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">Pokemon Evolution Trees</h1>
      <InfiniteScroll
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage ?? false}
        isLoading={isFetchingNextPage}
      >
        <div className="space-y-8 w-full">
          {allChains.map((chain) => (
            <EvolutionChain key={chain.id} chain={chain} />
          ))}
        </div>
      </InfiniteScroll>
    </>
  );
};

export default EvolutionTreesPage;
