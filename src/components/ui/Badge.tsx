import Link from 'next/link';
import { useEffect, ReactNode } from 'react';
import SkeletonBadge from './skeletons/SkeletonBadge';

export interface BadgeProps {
  // Content
  children: ReactNode;

  // Styling
  backgroundColor?: string;
  className?: string;
  square?: boolean;
  squareSize?: 'sm' | 'md' | 'lg';
  compact?: boolean;

  // Interactive
  href?: string;
  onClick?: () => void;

  // State
  loading?: boolean;
  onDataLoad?: () => void;
}

export default function Badge({
  children,
  backgroundColor,
  className = '',
  square,
  squareSize,
  compact = false,
  href,
  onClick,
  loading = false,
  onDataLoad,
}: BadgeProps) {
  // Call onDataLoad when component mounts
  useEffect(() => {
    if (onDataLoad) {
      onDataLoad();
    }
  }, [onDataLoad]);

  // Show skeleton while loading
  if (loading) {
    return <SkeletonBadge square={square} squareSize={squareSize} compact={compact} />;
  }

  const squareSizes = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
  };

  const badgeContent = (
    <span
      className={`
        inline-flex items-center justify-center font-semibold text-xs shadow-xs
        text-white uppercase tracking-tight
        ${square && squareSize ? squareSizes[squareSize] : 'w-14 rounded'}
        ${compact ? 'leading-none py-0.5' : 'px-2 py-0.5'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `.trim()}
      style={backgroundColor ? { backgroundColor } : undefined}
      onClick={onClick}
    >
      {children}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="hover:scale-105 transition-interactive">
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}
