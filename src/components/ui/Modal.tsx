'use client';

import React, { ReactNode, useState, useEffect, useMemo } from 'react';
import { clsx } from 'clsx';
import Icon, { IconType } from './icons';

interface ModalProps {
  children: ReactNode;
  isOpen?: boolean; // External control
  onClose?: () => void; // External control
  showTrigger?: boolean; // Whether to render trigger button
  triggerIcon?: IconType;
  triggerLabel?: string;
  modalTitle?: string;
  className?: string; // Modal content className
  triggerClassName?: string; // Trigger button className
  showHeader?: boolean; // Whether to show header with title and close button
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export default function Modal({
  children,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  showTrigger = true,
  triggerIcon = 'search',
  triggerLabel = 'Open modal',
  modalTitle = 'Modal',
  className = '',
  triggerClassName = '',
  showHeader = true,
  maxWidth = '2xl',
}: ModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const setIsOpen = useMemo(() => {
    return externalOnClose !== undefined
      ? (open: boolean) => !open && externalOnClose()
      : setInternalIsOpen;
  }, [externalOnClose]);

  // Close modal on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, setIsOpen]);

  // Close modal when clicking outside
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setIsOpen(false);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Max width classes
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  return (
    <>
      {/* Trigger Button - only render if showTrigger is true */}
      {showTrigger && (
        <button
          onClick={() => setIsOpen(true)}
          className={clsx(
            'inline-flex items-center justify-center border border-border',
            'w-10 h-10 rounded-lg cursor-pointer',
            'bg-surface hover:bg-brand/10 dark:hover:bg-brand/40',
            'active:bg-brand/20 dark:active:bg-brand/50',
            'text-subtle transition-theme',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
            triggerClassName,
          )}
          aria-label={triggerLabel}
        >
          <Icon type={triggerIcon} size="md" />
        </button>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className={clsx(
            'fixed inset-0 z-50',
            'bg-black/70 dark:bg-black/90',
            'flex items-center justify-center',
            'animate-[fadeIn_0.3s_ease-out]',
          )}
          onClick={handleBackdropClick}
        >
          {/* Modal Content */}
          <div className="w-full h-[80vh] flex flex-col items-center">
            <div
              className={clsx(
                'bg-background border border-border rounded-lg shadow-xl',
                'w-full',
                maxWidthClasses[maxWidth],
                'animate-[fadeInUp_0.5s_ease-out]',
                'transition-theme',
                className,
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Optional Header */}
              {showHeader && (
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-primary">{modalTitle}</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={clsx(
                      'inline-flex items-center justify-center',
                      'w-8 h-8 rounded cursor-pointer',
                      'hover:bg-surface active:bg-surface-elevated',
                      'text-subtle hover:text-primary',
                      'transition-theme',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                    )}
                    aria-label="Close modal"
                  >
                    <Icon type="close" size="md" />
                  </button>
                </div>
              )}

              {/* Modal Body - Flexible content area */}
              <div className={showHeader ? 'p-6' : 'p-6'}>{children}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

Modal.displayName = 'Modal';
