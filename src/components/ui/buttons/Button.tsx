import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import ButtonContent from './ButtonContent';
import { BaseButtonProps, buildButtonClassName } from './button-variants';

// Button-specific props (extends HTML button attributes)
export type ButtonProps = BaseButtonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps>;

// Simple Button component for standard HTML button usage
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
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

    return (
      <button
        ref={ref}
        className={clsx(buttonClassName)}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-pressed={active}
        {...props}
      >
        <ButtonContent size={size} loading={loading} iconLeft={iconLeft} iconRight={iconRight}>
          {children}
        </ButtonContent>
      </button>
    );
  },
);

// Display name for debugging
Button.displayName = 'Button';

export default Button;
