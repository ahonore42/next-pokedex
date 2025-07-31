import Skeleton from './Skeleton';

interface SkeletonArtworkProps {
  size?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  className?: string;
}

export default function SkeletonArtwork({
  size = 'size-96',
  aspectRatio = 'square',
  className = '',
}: SkeletonArtworkProps) {
  const aspectRatios = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  return (
    <div className={`relative ${size} ${aspectRatios[aspectRatio]} ${className}`}>
      <Skeleton
        className={`w-full h-full bg-transparent`}
        opacity="10"
        aria-label="Loading artwork"
      />
    </div>
  );
}
