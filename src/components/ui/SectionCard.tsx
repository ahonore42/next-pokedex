import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  title: string;
  tag?: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export default function SectionCard({
  children,
  title,
  tag = '',
  className = '',
  variant = 'default',
}: ContainerProps) {
  // Define variant-specific styles
  const variantStyles = {
    default: {
      padding: 'p-6',
      titleSize: 'text-lg',
      headerMargin: 'mb-4',
      tagSize: 'text-sm',
    },
    compact: {
      padding: 'p-4',
      titleSize: 'text-base',
      headerMargin: 'mb-2',
      tagSize: 'text-xs',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`surface-elevated border-theme rounded-lg ${styles.padding} transition-all duration-300 hover:shadow-lg ${className}`}
      style={{
        backgroundColor: 'var(--color-surface-elevated)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className={`flex items-center justify-between ${styles.headerMargin}`}>
        <h2 className={`${styles.titleSize} font-semibold text-primary`}>{title}</h2>
        {tag && (
          <span
            className={`${styles.tagSize} text-tertiary px-2 py-1 rounded transition-colors duration-300`}
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            {tag}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
