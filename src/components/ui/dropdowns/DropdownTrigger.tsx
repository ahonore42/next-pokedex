'use client';

import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import Button, { ButtonProps } from '../buttons/Button';
import Icon from '../icons';
import Dropdown, { DropdownProps } from './Dropdown';

export type TriggerType = 'button' | 'actions-button';
export type TriggerMode = 'click' | 'hover';

export interface DropdownTriggerProps
  extends Omit<DropdownProps, 'isOpen' | 'onClose' | 'trigger'> {
  triggerType?: TriggerType; // Type of trigger to render
  triggerMode?: TriggerMode; // How the dropdown should be triggered
  hoverDelay?: number; // Hover delay in milliseconds (for hover mode)
  /** Props to pass to the Button component (when triggerType is 'button') */
  buttonProps?: Omit<ButtonProps, 'onClick' | 'onMouseEnter' | 'onMouseLeave'>;
  customTrigger?: ReactNode; // Custom trigger element (overrides triggerType)
  buttonText?: string; // Button text (when triggerType is 'button')
  actionsButtonClassName?: string; // Additional CSS classes for the actions button
}

export default function DropdownTrigger({
  triggerType = 'button',
  triggerMode = 'click',
  hoverDelay = 200,
  buttonProps,
  customTrigger,
  buttonText = 'Options',
  actionsButtonClassName = '',
  children,
  ...dropdownProps
}: DropdownTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  // Check if mobile (below sm breakpoint - 640px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (triggerMode === 'hover') {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(handleOpen, hoverDelay);
    }
  };

  const handleMouseLeave = () => {
    if (triggerMode === 'hover') {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(handleClose, hoverDelay);
    }
  };

  const handleClick = () => {
    if (triggerMode === 'click') {
      setIsOpen(!isOpen);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Render the appropriate trigger
  const renderTrigger = () => {
    if (customTrigger) {
      return customTrigger;
    }

    const triggerProps = {
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    };

    if (triggerType === 'button') {
      return (
        <Button {...buttonProps} {...triggerProps} aria-expanded={isOpen} aria-haspopup="true">
          {buttonText}
        </Button>
      );
    }

    // Actions button (square button with actions icon or hamburger menu on mobile)
    return (
      <button
        {...triggerProps}
        className={clsx(
          'inline-flex items-center justify-center',
          'rounded cursor-pointer',
          isMobile
            ? 'w-8 h-8 bg-surface hover:bg-brand/10 dark:hover:bg-brand/40 active:bg-brand/20 dark:active:bg-brand/50'
            : 'rounded-full hover:bg-surface active:bg-surface-elevated',
          'text-subtle',
          actionsButtonClassName,
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={isMobile ? (isOpen ? 'Close menu' : 'Open menu') : 'Open options menu'}
      >
        {isMobile ? (
          // Hamburger menu that transitions to close icon on mobile
          isOpen ? (
            <Icon type="close" size="md" />
          ) : (
            <div className="w-4 h-3 flex flex-col justify-center items-center">
              <span className="bg-current transition-all duration-200 block h-0.5 w-4 rounded-sm -translate-y-0.5" />
              <span className="bg-current transition-all duration-200 block h-0.5 w-4 rounded-sm opacity-100" />
              <span className="bg-current transition-all duration-200 block h-0.5 w-4 rounded-sm translate-y-0.5" />
            </div>
          )
        ) : (
          // Actions icon for desktop
          <Icon type="actions" size="md" />
        )}
      </button>
    );
  };

  return (
    <div
      onMouseEnter={triggerMode === 'hover' ? handleMouseEnter : undefined}
      onMouseLeave={triggerMode === 'hover' ? handleMouseLeave : undefined}
    >
      <Dropdown {...dropdownProps} isOpen={isOpen} onClose={handleClose} trigger={renderTrigger()}>
        {children}
      </Dropdown>
    </div>
  );
}

DropdownTrigger.displayName = 'DropdownTrigger';
