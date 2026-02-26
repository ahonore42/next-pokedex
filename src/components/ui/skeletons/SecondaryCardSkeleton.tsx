import SectionCard from '~/components/ui/SectionCard';
import Skeleton from './Skeleton';

export default function SecondaryCardSkeleton({ title }: { title: string }) {
  return (
    <SectionCard title={title} variant="compact">
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded" />
        ))}
      </div>
    </SectionCard>
  );
}
