import SectionCard from '~/components/ui/SectionCard';
import Skeleton from './Skeleton';

export default function EvolutionChainSkeleton() {
  return (
    <SectionCard title="Evolution Chain" variant="compact">
      <Skeleton className="h-28 w-full rounded-lg" />
    </SectionCard>
  );
}
