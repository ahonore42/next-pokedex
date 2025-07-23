import { ReactNode } from 'react';
import clsx from 'clsx';

interface BaseSVGProps {
  children: ReactNode;
  viewBox?: string;
  fill?: string;
  stroke?: string;
  className?: string;
}

// Base SVG component for consistent SVG rendering
const BaseSVG: React.FC<BaseSVGProps> = ({
  children,
  viewBox = '0 0 24 24',
  fill = 'none',
  stroke = 'currentColor',
  className = '',
}) => (
  <svg
    className={clsx('w-full h-full', className)}
    fill={fill}
    stroke={stroke}
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

export default BaseSVG;
