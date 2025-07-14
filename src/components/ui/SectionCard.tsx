import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  title: string;
  tag?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'info';
  backgroundColor?: string;
  borderColor?: string;
  titleColor?: string;
  titleSize?: string;
}

export default function SectionCard({
  children,
  title,
  tag = '',
  className = '',
  variant = 'default',
  backgroundColor,
  borderColor,
  titleColor,
  titleSize,
}: ContainerProps) {
  // Define variant-specific styles
  const variantStyles = {
    default: {
      padding: 'p-6',
      titleSize: titleSize || 'text-lg',
      headerMargin: 'mb-4',
      tagSize: 'text-sm',
      bg: 'surface-elevated',
      text: 'text-primary dark:text-primary',
    },
    compact: {
      padding: 'p-4',
      titleSize: titleSize || 'text-base',
      headerMargin: 'mb-2',
      tagSize: 'text-xs',
      bg: 'surface-elevated',
      text: 'text-primary dark:text-primary',
    },
    info: {
      padding: 'p-4',
      titleSize: titleSize || 'text-base',
      headerMargin: 'mb-2',
      tagSize: 'text-xs',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-900 dark:text-blue-100',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`rounded-lg ${styles.padding} ${styles.bg} transition-all duration-300 ${className}`}
      style={{
        backgroundColor: backgroundColor || undefined,
        borderColor: borderColor || undefined,
      }}
    >
      <div className={`${styles.headerMargin}`}>
        <h4 className={`${styles.titleSize} font-medium ${titleColor || styles.text}`}>{title}</h4>
        {tag && (
          <span
            className={`${styles.tagSize} text-tertiary dark:text-tertiary px-2 py-1 rounded transition-colors duration-300`}
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
