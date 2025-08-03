'use client';

import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

export type DropdownPlacement = 'bottom' | 'top' | 'left' | 'right';

export interface DropdownProps {
  isOpen: boolean; // Whether the dropdown is visible
  onClose: () => void; // Callback when dropdown should close
  trigger: ReactNode; // The trigger element
  children: ReactNode; // The dropdown content
  placement?: DropdownPlacement; // Placement of the dropdown relative to trigger
  closeOnClickOutside?: boolean; // Whether dropdown should close when clicking outside
  closeOnClickInside?: boolean; // Whether dropdown should close when clicking inside
  closeOnEscape?: boolean; // Whether dropdown should close on escape key
  className?: string; // Additional CSS classes for the container
  contentClassName?: string; // Additional CSS classes for the dropdown content
  zIndex?: number; // Custom z-index for the dropdown
  toolbar?: boolean; // Whether to remove top padding and rounding for toolbar-style dropdowns
}

export default function Dropdown({
  isOpen,
  onClose,
  trigger,
  children,
  placement = 'bottom',
  closeOnClickOutside = true,
  closeOnClickInside = true,
  closeOnEscape = true,
  className = '',
  contentClassName = '',
  zIndex = 50,
  toolbar = false,
}: DropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTop, setMobileTop] = useState(0);

  // Handle clicks outside the dropdown
  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnClickOutside, onClose]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Calculate viewport-aware positioning
  useEffect(() => {
    // Check if mobile (below sm breakpoint - 640px)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (!isOpen || !contentRef.current || !containerRef.current) {
      setHorizontalOffset(0);
      setVerticalOffset(0);
      setMobileTop(0);
      return () => window.removeEventListener('resize', checkMobile);
    }

    const calculatePosition = () => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      // On mobile, calculate position relative to viewport
      if (isMobile) {
        const containerRect = container.getBoundingClientRect();
        setMobileTop(containerRect.bottom + 4); // 4px gap below trigger
        setHorizontalOffset(0);
        setVerticalOffset(0);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const buffer = 16; // Minimum distance from viewport edge

      let newHorizontalOffset = 0;
      let newVerticalOffset = 0;

      // Handle horizontal positioning
      if (placement === 'bottom' || placement === 'top') {
        const rightEdge = containerRect.left + contentRect.width;
        if (rightEdge > viewportWidth - buffer) {
          // Would overflow right, shift left
          newHorizontalOffset = -(rightEdge - (viewportWidth - buffer));
        }

        const leftEdge = containerRect.left + newHorizontalOffset;
        if (leftEdge < buffer) {
          // Would overflow left, shift right
          newHorizontalOffset = buffer - containerRect.left;
        }
      }

      // Handle vertical positioning
      if (placement === 'left' || placement === 'right') {
        const bottomEdge = containerRect.top + contentRect.height;
        if (bottomEdge > viewportHeight - buffer) {
          // Would overflow bottom, shift up
          newVerticalOffset = -(bottomEdge - (viewportHeight - buffer));
        }

        const topEdge = containerRect.top + newVerticalOffset;
        if (topEdge < buffer) {
          // Would overflow top, shift down
          newVerticalOffset = buffer - containerRect.top;
        }
      }

      setHorizontalOffset(newHorizontalOffset);
      setVerticalOffset(newVerticalOffset);
    };

    // Calculate position on open
    calculatePosition();

    // Recalculate on resize
    window.addEventListener('resize', calculatePosition);
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isOpen, placement, isMobile]);

  // Handle clicks inside the dropdown
  const handleContentClick = (event: React.MouseEvent) => {
    if (closeOnClickInside) {
      onClose();
    }
    event.stopPropagation();
  };

  const placements = {
    bottom: 'top-full mt-1',
    top: 'bottom-full mb-1',
    left: 'right-full mr-1',
    right: 'left-full ml-1',
  } as const;

  // Get placement classes
  const getPlacementClasses = (placement: DropdownPlacement) => {
    // On mobile, use fixed positioning below trigger
    if (isMobile) {
      return 'fixed left-0 right-0 w-full';
    }

    return placements[placement];
  };

  // Get transform style for positioning adjustments
  const getTransformStyle = () => {
    if (isMobile) {
      return {
        top: `${mobileTop}px`,
      };
    }

    if (horizontalOffset === 0 && verticalOffset === 0) return {};

    return {
      transform: `translate(${horizontalOffset}px, ${verticalOffset}px)`,
    };
  };

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {trigger}
      {isOpen && (
        <div
          ref={contentRef}
          className={clsx(
            'absolute',
            getPlacementClasses(placement),
            toolbar && 'pt-0 rounded-t-none animate-fade-in',
            contentClassName,
          )}
          style={{
            zIndex,
            ...getTransformStyle(),
            ...(toolbar && {
              animationDuration: '300ms',
            }),
          }}
          onClick={handleContentClick}
        >
          {children}
        </div>
      )}
    </div>
  );
}
