'use client';

import React, { ReactNode } from 'react';
import { clsx } from 'clsx';
import { useBreakpointWidth } from '~/hooks';
import {
  alignConfig,
  justifyConfig,
  spacingConfig,
  ToolbarAlign,
  ToolbarJustify,
  ToolbarSpacing,
  ToolbarMobileLayout,
  ToolbarOrientation,
} from './toolbars.config';

export interface ToolbarProps {
  children: ReactNode;
  orientation?: ToolbarOrientation;
  mobileBreakpoint?: number;
  mobileLayout?: ToolbarMobileLayout;
  spacing?: ToolbarSpacing;
  justify?: ToolbarJustify;
  align?: ToolbarAlign;
  wrap?: boolean;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
  'aria-label'?: string;
}

export default function Toolbar({
  children,
  orientation = 'responsive',
  mobileBreakpoint = 768,
  mobileLayout = 'dropdown',
  spacing = 'normal',
  justify = 'start',
  align = 'center',
  wrap = false,
  className = '',
  mobileClassName = '',
  desktopClassName = '',
  'aria-label': ariaLabel = 'Toolbar',
}: ToolbarProps) {
  const breakpointWidth = useBreakpointWidth();
  const isMobile = breakpointWidth < mobileBreakpoint;

  // Determine orientation class
  const getOrientationClass = () => {
    if (orientation === 'vertical') return 'flex-col';
    if (orientation === 'horizontal') return 'flex-row';
    // responsive
    if (isMobile && mobileLayout === 'stack') return 'flex-col';
    return 'flex-row';
  };

  // Build toolbar classes
  const toolbarClasses = clsx(
    'flex',
    getOrientationClass(),
    spacingConfig[spacing],
    justifyConfig[justify],
    alignConfig[align],
    wrap && 'flex-wrap',
    mobileLayout === 'overflow' && isMobile && 'overflow-x-auto',
    isMobile ? mobileClassName : desktopClassName,
    className,
  );

  return (
    <div className={toolbarClasses} role="toolbar" aria-label={ariaLabel}>
      {children}
    </div>
  );
}
