import { ReactNode } from 'react';
import clsx from 'clsx';

// Size variant system
export type IconSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export const sizeVariants = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
  xl: 'size-6',
  '2xl': 'size-8',
} as const;

// Icon wrapper component for consistent sizing - internal use only
const IconWrapper = ({
  children: iconChildren,
  size = 'md',
  className = '',
}: {
  children: ReactNode;
  size?: IconSize;
  className?: string;
}) => (
  <span className={clsx('flex-shrink-0 inline-flex', sizeVariants[size], className)}>
    {iconChildren}
  </span>
);

export default IconWrapper;
