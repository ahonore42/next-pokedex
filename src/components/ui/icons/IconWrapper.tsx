import { ReactNode } from 'react';
import clsx from 'clsx';
import { IconSize, sizeVariants } from './icons.config';

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
