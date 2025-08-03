import clsx from 'clsx';
import { ReactNode } from 'react';
import { useBreakpointWidth } from '~/hooks';

export interface ToolbarSectionProps {
  children: ReactNode;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  className?: string;
}

export default function ToolbarSection({
  children,
  hideOnMobile = false,
  hideOnDesktop = false,
  className = '',
}: ToolbarSectionProps) {
  const breakpointWidth = useBreakpointWidth();
  const isMobile = breakpointWidth < 768;

  // Hide based on viewport
  if ((isMobile && hideOnMobile) || (!isMobile && hideOnDesktop)) {
    return null;
  }

  return <div className={clsx('flex items-center gap-2', className)}>{children}</div>;
}

ToolbarSection.displayName = 'ToolbarSection';
