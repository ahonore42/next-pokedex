import PageContent from '~/components/layout/PageContent';
import SectionCard from '~/components/ui/SectionCard';
import Skeleton from './Skeleton';
import SkeletonArtwork from './SkeletonArtwork';
import EvolutionChainSkeleton from './EvolutionChainSkeleton';
import SecondaryCardSkeleton from './SecondaryCardSkeleton';

export default function PokemonDetailSkeleton() {
  return (
    <PageContent>
      <SectionCard colorVariant="article">
        <div className="flex flex-col gap-4">
          {/* Artwork + sprites row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full h-96 flex items-center justify-center bg-surface rounded-lg">
              <SkeletonArtwork size="size-96" />
            </div>
            <div className="w-full flex flex-col justify-between gap-4 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Info grid — mirrors PokemonInfo layout */}
          <div className="flex-auto grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Left column: stacked rows matching PokemonInfo's flex-wrap behaviour */}
            <div className="flex flex-col gap-4">
              {/* Row 1: Type + Pokemon Cries side by side */}
              <div className="flex flex-wrap gap-4">
                <SectionCard title="Type" variant="compact" className="flex-auto">
                  <Skeleton className="h-7 w-full rounded" />
                </SectionCard>

                <SectionCard title="Pokemon Cries" variant="compact" className="flex-auto">
                  <Skeleton className="h-9 w-full rounded" />
                </SectionCard>
              </div>

              {/* Row 2: Breeding + Gender Ratio side by side */}
              <div className="flex flex-wrap gap-4">
                <SectionCard variant="compact" className="flex-auto">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <h3 className="text-md text-primary font-semibold mb-2 whitespace-nowrap">Egg Groups</h3>
                      <Skeleton className="h-7 w-24 rounded-full" />
                    </div>
                    <div>
                      <h3 className="text-md text-primary font-semibold mb-2 whitespace-nowrap">Hatch Time</h3>
                      <Skeleton className="h-5 w-20 rounded" />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Gender Ratio" variant="compact" className="flex-auto">
                  <Skeleton className="h-8 w-full rounded" />
                </SectionCard>
              </div>
            </div>

            {/* Right column: EV Yield alone, then Height/Weight/Catch Rate/Base Happiness */}
            <div className="flex flex-col gap-4">
              <SectionCard title="EV Yield" variant="compact">
                <Skeleton className="h-10 w-full rounded" />
              </SectionCard>

              {/* Row 2: Height + Weight + Catch Rate + Base Happiness side by side */}
              <div className="flex flex-wrap gap-4">
                <SectionCard title="Height" variant="compact" className="flex-auto">
                  <Skeleton className="h-8 w-full rounded" />
                </SectionCard>

                <SectionCard title="Weight" variant="compact" className="flex-auto">
                  <Skeleton className="h-8 w-full rounded" />
                </SectionCard>

                <SectionCard title="Catch Rate" variant="compact" className="flex-auto">
                  <Skeleton className="h-8 w-full rounded" />
                </SectionCard>

                <SectionCard title="Base Happiness" variant="compact" className="flex-auto text-wrap">
                  <Skeleton className="h-8 w-full rounded" />
                </SectionCard>
              </div>
            </div>
          </div>

          {/* Flavor Texts — GenerationFilter title style */}
          <SectionCard variant="compact">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-md font-bold text-primary mb-4 sm:mb-0">Flavor Texts</h2>
              <Skeleton className="h-8 w-36 rounded" />
            </div>
            <Skeleton className="h-20 w-full rounded" />
          </SectionCard>
        </div>
      </SectionCard>

      {/* Stats + abilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Base Stats" variant="compact">
          <Skeleton className="h-52 w-full rounded" />
        </SectionCard>
        <SectionCard title="Abilities" variant="compact">
          <Skeleton className="h-52 w-full rounded" />
        </SectionCard>
      </div>

      {/* Stat table */}
      <SectionCard>
        <Skeleton className="h-28 w-full rounded" />
      </SectionCard>

      <EvolutionChainSkeleton />
      <SecondaryCardSkeleton title="Locations" />
      <SecondaryCardSkeleton title="Moves" />
    </PageContent>
  );
}
