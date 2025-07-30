import Skeleton from './Skeleton';

interface SkeletonSpriteProps {
  variant?: 'sm' | 'md' | 'lg';
  animation?: 'shimmer' | 'pulse';
  types?: boolean;
  className?: string;
}

export default function SkeletonSprite({
  variant = 'md',
  animation = 'shimmer',
  types = true,
  className = '',
}: SkeletonSpriteProps) {
  // Match the exact container variants from Sprite component for layout preservation
  const variants = {
    sm: {
      container: 'w-16 h-16',
    },
    md: {
      container: types ? 'min-w-36 h-36' : 'min-w-32 h-32',
    },
    lg: {
      container: types ? 'w-44 h-44' : 'w-36 h-36',
    },
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={`
        flex flex-col justify-center p-4 space-y-3
        rounded-lg border border-border surface
        ${currentVariant.container} 
        ${className}
      `}
      role="status"
      aria-label="Loading Pokemon"
    >
      {/* Full width rounded bars with equal spacing */}
      <Skeleton className="h-4 w-full rounded-full" animation={animation} />
      <Skeleton className="h-4 w-full rounded-full" animation={animation} />
      <Skeleton className="h-4 w-full rounded-full" animation={animation} />
    </div>
  );
}
