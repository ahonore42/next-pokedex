import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
  animation?: 'shimmer' | 'pulse';
  opacity?: '10' | '20' | '30' | '40' | '50' | '60' | '70' | '80' | '90';
  'aria-label'?: string;
}

export default function Skeleton({
  className = '',
  children,
  animation = 'shimmer',
  opacity,
  'aria-label': ariaLabel = 'Loading content',
}: SkeletonProps) {
  const opacityValue = opacity && (`opacity-${opacity}` as const);
  return (
    <div
      className={clsx(
        'relative overflow-hidden',
        `bg-gray-200 dark:bg-gray-700 ${opacityValue && opacityValue}`,
        'rounded',
        animation === 'shimmer'
          ? `bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 
          bg-[length:200%_100%] animate-[shimmer_2s_infinite] ${opacityValue && opacityValue}`
          : 'animate-pulse',
        className,
      )}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      {children}
    </div>
  );
}
