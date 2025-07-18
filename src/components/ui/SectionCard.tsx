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
      titleSize: 'text-lg',
      headerMargin: title && 'mb-4',
      tagSize: 'text-sm',
      shadow: 'shadow-sm hover:shadow-md',
    },
    compact: {
      titleSize: 'text-base',
      headerMargin: title && 'mb-2',
      tagSize: 'text-xs',
      shadow: 'shadow-xs hover:shadow-sm',
    },
  } as const;

  // Color variant system with corresponding borders and hover states
  const colorVariantStyles = {
    default: {
      background: 'surface',
    },
    update: {
      background: 'update',
    },
    pokemon: {
      background: 'pokemon',
    },
    info: {
      background: 'info',
    },
    transparent: {
      background: 'bg-transparent',
    },
  } as const;

  const styles = variantStyles[variant] || variantStyles.default;
  const colorStyles = colorVariantStyles[colorVariant] || colorVariantStyles.default;

  return (
    <div
      className={clsx(
        'card theme-transition',
        colorStyles.background,
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
