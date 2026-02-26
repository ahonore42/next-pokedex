import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { usePageLoading } from '~/components/layout/DefaultLayout';
import { useBreakpointWidth } from '~/hooks';
import SectionCard from '~/components/ui/SectionCard';
import TypeEffectivenessChart from '~/components/pokemon-types/TypeEffectivenessChart';
import PageHeading from '~/components/layout/PageHeading';
import PageContent from '~/components/layout/PageContent';
import TypeInfo from '~/components/pokemon-types/TypeInfo';
import MobileTypeChart from '~/components/pokemon-types/MobileTypeChart';
import TypeEffectivenessKey from '~/components/pokemon-types/TypeEffectivenessKey';
import TypesDisplay from '~/components/pokemon-types/TypesDisplay';
import SameTypeAttackBoost from '~/components/pokemon-types/SameTypeAttackBoost';
import EffectivenessGrid from '~/components/pokemon-types/EffectivenessGrid';

const TypesPage: NextPageWithLayout = () => {
  const breakpointWidth = useBreakpointWidth();
  const { data: allEfficacies, isLoading } = trpc.types.getAllTypeEfficacies.useQuery();

  const isPageLoading = isLoading || !allEfficacies?.length;
  usePageLoading(isPageLoading);
  if (isPageLoading) {
    return null;
  }

  return (
    <>
      <PageHeading
        pageTitle="Pokémon Types - Complete Type Chart & Effectiveness Guide"
        metaDescription="Comprehensive Pokémon type chart with effectiveness, strengths, and weaknesses. Master type matchups for all 18 Pokémon types."
        ogImage="/pokemon-types-preview.png" // TODO - Add a preview image later
        schemaType="WebPage"
        breadcrumbLinks={[{ label: 'Home', href: '/' }]}
        currentPage="Pokémon Types"
        title="Pokémon Types"
        subtitle="Type Effectiveness and Mechanics"
      />

      <PageContent className="flex-grow">
        <SectionCard title="Type Details" colorVariant="transparent">
          <TypesDisplay link />
        </SectionCard>
        <div className="grid xl:grid-cols-2 gap-4">
          <TypeInfo />
          <SameTypeAttackBoost />
        </div>
        <EffectivenessGrid />

        {breakpointWidth < 768 ? (
          <SectionCard title="Type Effectiveness" colorVariant="transparent">
            <div>
              <MobileTypeChart efficacies={allEfficacies} />
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title="Type Effectiveness Chart"
            colorVariant="transparent"
            className="px-0 mx-auto min-h-240 lg:min-h-260 xl:min-h-280"
          >
            <div className="w-full flex flex-col items-center justify-center gap-4">
              {/* Key Section */}
              <div className="flex flex-col gap-2 items-center w-156 lg:w-192 xl:w-232 min-h-24 xl:self-end">
                <div className="w-full h-12 flex items-center justify-between border-b border-border">
                  <h3 className="font-semibold leading-none">Usage</h3>
                  <div className="surface rounded-lg p-2 border border-border w-84">
                    <div className="text-xs text-primary space-y-1">
                      <div className="text-center">
                        <strong>Attacking type</strong> (rows) vs <strong>Defending type</strong>{' '}
                        (columns)
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-muted leading-relaxed text-sm ">
                  Look down the left hand side for the attacking type, then move across to see how
                  effective it is against each defending type.
                </p>
              </div>
              <div className="flex flex-col xl:flex-row gap-4 items-center xl:min-h-[932px]">
                <TypeEffectivenessKey />
                <div className="min-h-[628px] lg:min-h-[780px] xl:min-h-[932px]">
                  <TypeEffectivenessChart efficacies={allEfficacies} />
                </div>
              </div>
            </div>
          </SectionCard>
        )}
      </PageContent>
    </>
  );
};

export default TypesPage;
