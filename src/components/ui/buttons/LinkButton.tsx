import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import Link from 'next/link';
import ButtonContent from './ButtonContent';
import { BaseButtonProps, buildButtonClassName } from './button-variants';

// LinkButton component types
type LinkButtonInternal = BaseButtonProps &
  Omit<React.ComponentProps<typeof Link>, keyof BaseButtonProps> & {
    type: 'internal';
    href: string;
  };

type LinkButtonExternal = BaseButtonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    type: 'external';
    href: string;
  };

export type LinkButtonProps = LinkButtonInternal | LinkButtonExternal;

// LinkButton component with automatic internal/external link delegation
export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      children,
      size = 'md',
      variant = 'primary',
      disabled = false,
      loading = false,
      active = false,
      fullWidth = false,
      showFocus = false,
      iconLeft,
      iconRight,
      className = '',
      type,
      href,
      ...props
    },
    ref,
  ) => {
    // Determine if button should be disabled (disabled prop or loading state)
    const isDisabled = disabled || loading;

    // Check if button has icons for spacing
    const hasIcons = !!(iconLeft || iconRight || loading);

    // Build className using shared utility
    const buttonClassName = buildButtonClassName(
      size,
      variant,
      disabled,
      loading,
      fullWidth,
      showFocus,
      hasIcons,
      className,
    );

    // Explicit render paths for each navigation type
    if (type === 'internal') {
      return (
        <Link
          ref={ref}
          href={href}
          className={clsx(buttonClassName)}
          aria-disabled={isDisabled}
          aria-pressed={active}
          {...props}
        >
          <ButtonContent size={size} loading={loading} iconLeft={iconLeft} iconRight={iconRight}>
            {children}
          </ButtonContent>
        </Link>
      );
    }

    return (
      <a
        ref={ref}
        href={href}
        className={clsx(buttonClassName)}
        aria-disabled={isDisabled}
        aria-pressed={active}
        {...props}
      >
        <ButtonContent size={size} loading={loading} iconLeft={iconLeft} iconRight={iconRight}>
          {children}
        </ButtonContent>
      </a>
    );
  },
);

// Display name for debugging
LinkButton.displayName = 'LinkButton';

export default LinkButton;
