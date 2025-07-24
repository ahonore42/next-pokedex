import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface SectionCardProps {
  children: ReactNode;
  title?: string;
  tag?: string;
  className?: string;
  variant?: 'default' | 'compact';
  colorVariant?: 'default' | 'update' | 'pokemon' | 'info' | 'highlight' | 'transparent';
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
      titleSize: 'text-xl font-bold',
      headerMargin: title && 'mb-4',
      tagSize: 'text-sm',
      shadow: 'shadow-sm hover:shadow-md',
    },
    compact: {
      titleSize: 'text-base font-medium',
      headerMargin: title && 'mb-2',
      tagSize: 'text-xs',
      shadow: 'shadow-xs hover:shadow-sm',
    },
  } as const;

  // Color variant system with corresponding borders and hover states
  const colorVariantStyles = {
    default: {
      background: 'surface',
      tagColor: 'bg-pokemon text-subtle',
    },
    update: {
      background: 'update',
      tagColor: 'bg-pokemon text-subtle',
    },
    pokemon: {
      background: 'pokemon',
      tagColor: 'bg-pokemon text-subtle',
    },
    info: {
      background: 'info',
      tagColor: 'info-fill',
    },
    highlight: {
      background: 'highlight',
      tagColor: 'highlight-fill',
    },
    transparent: {
      background: 'bg-transparent',
      tagColor: 'bg-pokemon text-subtle',
    },
  } as const;

  const styles = variantStyles[variant] || variantStyles.default;
  const colorStyles = colorVariantStyles[colorVariant] || colorVariantStyles.default;

  return (
    <div
      className={clsx(
        'card',
        colorStyles.background,
        hover && [
          'transition-interactive', // Add transform transitions when interactive
          'hover:-translate-y-0.5 active:scale-[0.99]',
          styles.shadow,
        ],
        className,
      )}
    >
      <div className={clsx('flex justify-between items-start text-primary', styles.headerMargin)}>
        {title && <h4 className={clsx(styles.titleSize)}>{title}</h4>}
        {tag && (
          <span
            className={clsx(
              styles.tagSize,
              colorStyles.tagColor,
              'px-2 py-1 rounded font-semibold flex-shrink-0',
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
