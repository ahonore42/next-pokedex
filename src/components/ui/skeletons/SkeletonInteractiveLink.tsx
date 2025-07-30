import Skeleton from './Skeleton';

interface SkeletonInteractiveLinkProps {
  height: 'sm' | 'md' | 'lg';
  animation?: 'shimmer' | 'pulse';
  className?: string;
}

export default function SkeletonInteractiveLink({
  height = 'md',
  animation = 'shimmer',
  className = '',
}: SkeletonInteractiveLinkProps) {
  // Match the exact container heights from InteractiveLink
  const containerHeights = {
    sm: 'h-20',
    md: 'h-24',
    lg: 'h-36',
  };

  return (
    <div
      className={`
        ${containerHeights[height]}
        block border pokemon card
        flex flex-col justify-center p-4 space-y-3
        ${className}
      `}
      role="status"
      aria-label="Loading interactive link"
    >
      {/* Three evenly spaced bars spanning full width */}
      <Skeleton className="h-4 w-full rounded" animation={animation} />
      <Skeleton className="h-4 w-full rounded" animation={animation} />
      <Skeleton className="h-4 w-full rounded" animation={animation} />
    </div>
  );
}
