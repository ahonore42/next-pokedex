import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { usePageLoading } from '~/lib/contexts/LoadingContext';
import SectionCard from '~/components/ui/SectionCard';
import TypeBadge from '~/components/pokemon-types/TypeBadge';
import TypeEffectivenessChart from '~/components/pokemon-types/TypeEffectivenessChart';
import PageHeading from '~/components/layout/PageHeading';

const TypesPage: NextPageWithLayout = () => {
  const { data: types, isLoading } = trpc.types.allTypes.useQuery();

  // Use the loading context instead of LoadingPage
  usePageLoading(isLoading || !types);

  if (isLoading || !types) {
    return null; // Let DefaultLayout handle the loading display
  }

  return (
    <>
      <PageHeading
        pageTitle="Pokémon Types - Complete Type Chart & Effectiveness Guide"
        metaDescription="Comprehensive Pokémon type chart with effectiveness, strengths, and weaknesses. Master type matchups for all 18 Pokémon types."
        ogImage="/pokemon-types-preview.png" // Add a preview image later
        schemaType="WebPage"
        breadcrumbLinks={[{ label: 'Home', href: '/' }]}
        currentPage="Pokémon Types"
        title="Pokémon Types"
      />

      <SectionCard colorVariant="transparent" className='mt-8'>
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
