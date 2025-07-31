import Link from 'next/link';
import { useEffect } from 'react';
// import { AllTypesOutput } from '~/server/routers/_app';
import { getTypeColor, truncateTypeName } from '~/utils/pokemon';
import SkeletonBadge from '../ui/skeletons/SkeletonBadge';
import { PokemonTypeName } from '~/server/routers/_app';

export interface TypeBadgeProps {
  type: PokemonTypeName;
  link?: boolean;
  square?: boolean;
  squareSize?: 'sm' | 'md' | 'lg';
  compact?: boolean;
  loading?: boolean;
  onDataLoad?: () => void;
}

export default function TypeBadge({
  type,
  link = true,
  square,
  squareSize,
  compact = false,
  loading = false,
  onDataLoad,
}: TypeBadgeProps) {
  // Call onDataLoad when not loading
  useEffect(() => {
    if (onDataLoad) {
      onDataLoad();
    }
  }, [onDataLoad]);

  // Show skeleton while loading
  if (loading) {
    return <SkeletonBadge square={square} compact={compact} />;
  }

  const squareSizes = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
  };

  const color = getTypeColor(type);
  const nameLength = square ? 'short' : 'medium';
  const displayName = truncateTypeName(type, nameLength);

  const badgeContent = (
    <span
      className={`flex items-center justify-center text-white font-medium capitalize shadow-xs text-xs
        ${square && squareSize ? squareSizes[squareSize] : 'w-14 rounded'} ${compact ? 'leading-none py-0.5' : 'px-2 py-0.5  '}
        `}
      style={{
        backgroundColor: color,
      }}
    >
      {displayName}
    </span>
  );

  if (link) {
    return (
      <Link href={`/pokemon-types/${type}`} className="hover:scale-105 transition-interactive">
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}
