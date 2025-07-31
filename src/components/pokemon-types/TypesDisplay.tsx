import SectionCard from '~/components/ui/SectionCard';
import TypeBadge from '~/components/pokemon-types/TypeBadge';

import { AllTypesOutput } from '~/server/routers/_app';
import { useComponentHydration } from '~/hooks/useComponentHydration';

interface TypesDisplayProps {
  types: AllTypesOutput;
}

export default function TypesDisplay({ types }: TypesDisplayProps) {
  const { containerRef, allDataLoaded, handleDataLoad } = useComponentHydration(
    types.length,
    'types-display',
  );

  return (
    <SectionCard colorVariant="transparent" className="min-h-28 sm:min-h-20 xl:min-h-12">
      <div ref={containerRef} className="flex flex-wrap gap-4 justify-center xl:justify-between">
        {types.map((type) => (
          <TypeBadge
            key={type.id}
            type={type.name}
            loading={!allDataLoaded}
            onDataLoad={handleDataLoad}
          />
        ))}
      </div>
    </SectionCard>
  );
}
