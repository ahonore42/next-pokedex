import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import type { EvolutionChainsPaginatedOutput } from '~/server/routers/_app';
import EvolutionChain from '~/components/evolutions/EvolutionChain';
import InfiniteScroll from '~/components/ui/InfiniteScroll';
import PageHeading from '~/components/layout/PageHeading';

const EvolutionChainsPage: NextPageWithLayout = () => {
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, error } =
    trpc.evolutionChains.paginated.useInfiniteQuery(
      {
        limit: 20,
      },
      {
        getNextPageParam: (lastPage: EvolutionChainsPaginatedOutput) => lastPage.nextCursor,
      },
    );

  const isPageLoading = isLoading || !data?.pages;

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isPageLoading) {
    return null; // Let DefaultLayout handle the loading display
  }

  const allChains = data.pages.flatMap((page) => page.chains) ?? [];

  return (
    <>
      <PageHeading
        pageTitle="Pokémon Evolution Chains - Complete Evolution Guide"
        metaDescription="Explore comprehensive Pokémon evolution chains. Discover evolution paths, requirements, and relationships for all Pokémon species."
        ogImage="/pokemon-evolutions-preview.png"
        schemaType="WebPage"
        breadcrumbLinks={[{ label: 'Home', href: '/' }]}
        currentPage="Evolution Chains"
        title="Evolution Chains"
        subtitle="Evolution paths and requirements for all Pokémon species"
      />

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

export default EvolutionChainsPage;
