import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface SectionCardProps {
  children: ReactNode;
  title?: string;
  tag?: string;
  className?: string;
  variant?: 'default' | 'compact';
  colorVariant?: 'default' | 'update' | 'pokemon' | 'info' | 'transparent';
  hover?: boolean;
}

export default function SectionCard({
  children,
  title,
  tag = '',
  className = '',
  variant = 'default',
  colorVariant = 'default',
  hover = false,
}: SectionCardProps) {
  // Variant system for sizing and spacing
  const variantStyles = {
    default: {
      padding: 'p-6',
      titleSize: 'text-lg',
      headerMargin: title && 'mb-4',
      tagSize: 'text-sm',
      shadow: 'shadow-sm hover:shadow-md',
    },
    compact: {
      padding: 'p-4',
      titleSize: 'text-base',
      headerMargin: title && 'mb-2',
      tagSize: 'text-xs',
      shadow: 'shadow-xs hover:shadow-sm',
    },
  } as const;

  // Color variant system with corresponding borders and hover states
  const colorVariantStyles = {
    default: {
      background: 'bg-surface-elevated',
      border: 'border border-border',
      borderHover: 'hover:border-border-hover',
      backgroundHover: '', // No additional hover background
    },
    update: {
      background: 'bg-update',
      border: 'border-l-4 border-emerald-600 dark:border-emerald-500',
      borderHover: '', // No border hover for update variant
      backgroundHover: 'hover:bg-update-hover',
    },
    pokemon: {
      background: 'bg-pokemon',
      border: 'border border-pokemon-border',
      borderHover: 'hover:border-pokemon-border-hover',
      backgroundHover: 'hover:bg-pokemon-hover',
    },
    info: {
      background: 'bg-blue-900/10 dark:bg-blue-900/30',
      border: 'border border-blue-800/20 dark:border-blue-700',
      borderHover: '', // No border hover for info variant
      backgroundHover: 'hover:bg-blue-900/15 dark:hover:bg-blue-900/40',
    },
    transparent: {
      background: 'bg-transparent',
      border: '', // No borders
      borderHover: '', // No hover effects
      backgroundHover: '', // No hover effects
    },
  } as const;

  const styles = variantStyles[variant] || variantStyles.default;
  const colorStyles = colorVariantStyles[colorVariant] || colorVariantStyles.default;

  return (
    <div
      className={clsx(
        // Base styling using your Tailwind config
        'rounded-lg theme-transition',
        colorStyles.background,
        colorStyles.border,
        // Conditional hover effects based on hover prop
        hover && colorStyles.borderHover,
        hover && colorStyles.backgroundHover,
        styles.padding,
        // Conditional shadow and transform effects based on hover prop
        hover && styles.shadow,
        hover && 'hover:-translate-y-0.5 active:scale-[0.99]',
        'transition-all duration-theme ease-theme',
        className,
      )}
    >
      <div className={clsx('flex justify-between items-start', styles.headerMargin)}>
        {title && <h4 className={clsx(styles.titleSize, 'font-medium text-primary')}>{title}</h4>}

        {tag && (
          <span
            className={clsx(
              styles.tagSize,
              'text-primary bg-pokemon',
              'px-2 py-1 rounded-md flex-shrink-0',
            )}
          >
            {tag}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

// Display name for debugging
SectionCard.displayName = 'SectionCard';
