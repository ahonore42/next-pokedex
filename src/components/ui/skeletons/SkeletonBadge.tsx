import Skeleton from './Skeleton';

interface SkeletonBadgeProps {
  square?: boolean;
  squareSize?: 'sm' | 'md' | 'lg';
  compact?: boolean;
  animation?: 'shimmer' | 'pulse';
  className?: string;
}

export default function SkeletonBadge({
  square = false,
  squareSize,
  compact = false,
  animation = 'shimmer',
  className = '',
}: SkeletonBadgeProps) {
  const squareSizes = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
  };

  const sizeClass =
    square && squareSize
      ? squareSizes[squareSize] // Square badges from TypeBadge
      : 'w-14 h-5'; // Regular badges with rounded corners

  const paddingClass = compact ? 'p-0' : 'px-2 py-0.5';

  return (
    <Skeleton
      className={`
        ${sizeClass}
        ${paddingClass}
        ${!square ? 'rounded' : 'rounded'}
        ${className}
      `}
      animation={animation}
      aria-label="Loading type badge"
    />
  );
}
