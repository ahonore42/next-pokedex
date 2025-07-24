import { ReactNode } from 'react';
import { IconType } from '../icons';

// Define literal union types for better type safety
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'brand'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'success';

// Base button props interface
export interface BaseButtonProps {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
  fullWidth?: boolean;
  showFocus?: boolean;
  iconLeft?: IconType;
  iconRight?: IconType;
  className?: string;
  'aria-label'?: string;
}

// Size variant system
export const sizeVariants = {
  xs: {
    base: 'px-2 py-1 text-xs',
    iconSpacing: 'gap-1',
    iconSize: 'sm',
    minHeight: 'min-h-[24px]',
    minWidth: 'min-w-[64px]',
  },
  sm: {
    base: 'px-3 py-1.5 text-sm',
    iconSpacing: 'gap-1.5',
    iconSize: 'md',
    minHeight: 'min-h-[32px]',
    minWidth: 'min-w-[80px]',
  },
  md: {
    base: 'px-4 py-2 text-sm',
    iconSpacing: 'gap-2',
    iconSize: 'md',
    minHeight: 'min-h-[40px]',
    minWidth: 'min-w-[96px]',
  },
  lg: {
    base: 'px-6 py-3 text-base',
    iconSpacing: 'gap-2',
    iconSize: 'lg',
    minHeight: 'min-h-[48px]',
    minWidth: 'min-w-[112px]',
  },
  xl: {
    base: 'px-8 py-3 text-lg',
    iconSpacing: 'gap-3',
    iconSize: 'xl',
    minHeight: 'min-h-[48px]',
    minWidth: 'min-w-[128px]',
  },
} as const;

// Color variant system integrating theme tokens
export const colorVariants = {
  primary: {
    base: 'bg-blue-600 text-white border-blue-600',
    hover: 'hover:bg-blue-700 hover:border-blue-700',
    active: 'active:bg-blue-800 active:border-blue-800',
    focus: 'focus:bg-blue-700 focus:border-blue-700',
    disabled: 'disabled:bg-disabled disabled:text-disabled-text disabled:border-disabled',
  },
  brand: {
    base: 'bg-brand text-white border-brand',
    hover: 'hover:bg-brand-hover hover:border-brand-hover',
    active: 'active:bg-brand-active active:border-brand-active',
    focus: 'focus:bg-brand-hover focus:border-brand-hover',
    disabled: 'disabled:bg-disabled disabled:text-disabled-text disabled:border-disabled',
  },
  secondary: {
    base: 'bg-secondary text-primary border-border',
    hover: 'hover:bg-hover hover:border-border-hover',
    active: 'active:bg-active active:border-border-strong',
    focus: 'focus:bg-hover focus:border-border-hover',
    disabled: 'disabled:bg-disabled disabled:text-disabled-text disabled:border-disabled',
  },
  outline: {
    base: 'bg-transparent text-primary border-border',
    hover: 'hover:bg-interactive hover:border-border-hover',
    active: 'active:bg-active active:border-border-strong',
    focus: 'focus:bg-interactive focus:border-border-hover',
    disabled: 'disabled:text-disabled-text disabled:border-disabled',
  },
  ghost: {
    base: 'bg-transparent text-primary border-transparent',
    hover: 'hover:bg-interactive hover:text-brand',
    active: 'active:bg-active',
    focus: 'focus:bg-interactive focus:text-brand',
    disabled: 'disabled:text-disabled-text',
  },
  destructive: {
    base: 'bg-red-600 text-white border-red-600',
    hover: 'hover:bg-red-700 hover:border-red-700',
    active: 'active:bg-red-800 active:border-red-800',
    focus: 'focus:bg-red-700 focus:border-red-700',
    disabled: 'disabled:bg-disabled disabled:text-disabled-text disabled:border-disabled',
  },
  success: {
    base: 'bg-emerald-600 text-white border-emerald-600',
    hover: 'hover:bg-emerald-700 hover:border-emerald-700',
    active: 'active:bg-emerald-800 active:border-emerald-800',
    focus: 'focus:bg-emerald-700 focus:border-emerald-700',
    disabled: 'disabled:bg-disabled disabled:text-disabled-text disabled:border-disabled',
  },
} as const;

// Utility function to build button classes
export function buildButtonClassName(
  size: ButtonSize,
  variant: ButtonVariant,
  disabled: boolean,
  loading: boolean,
  fullWidth: boolean,
  showFocus: boolean,
  hasIcons: boolean,
  className: string,
): string {
  const sizeKey = size as keyof typeof sizeVariants;
  const variantKey = variant as keyof typeof colorVariants;

  const sizeVariant = sizeVariants[sizeKey];
  const colorVariant = colorVariants[variantKey];

  const isDisabled = disabled || loading;

  return [
    // Base button styles
    'inline-flex items-center justify-center',
    'font-medium rounded-lg border',
    'transition-interactive',
    'select-none cursor-pointer',

    // Size variants
    sizeVariant.base,
    sizeVariant.minHeight,
    sizeVariant.minWidth,

    // Icon spacing when icons are present
    hasIcons && sizeVariant.iconSpacing,

    // Color variants
    colorVariant.base,
    !isDisabled && colorVariant.hover,
    !isDisabled && colorVariant.active,
    !isDisabled && showFocus && colorVariant.focus,
    colorVariant.disabled,

    // State-specific styles
    fullWidth && 'w-full',
    isDisabled && 'cursor-not-allowed transform-none',

    // Custom className
    className,
  ]
    .filter(Boolean)
    .join(' ');
}
