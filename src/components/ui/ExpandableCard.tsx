import { ReactNode, useState, useCallback } from 'react';

interface ExpandableCardProps {
  children: ReactNode;
  title: string;
  tag?: string;
  className?: string;
  variant?: 'default' | 'compact';
  defaultExpanded?: boolean;
  disabled?: boolean;
  onToggle?: (isExpanded: boolean) => void;
}

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
} as const;

export default function ExpandableCard({
  children,
  title,
  tag = '',
  className = '',
  variant = 'default',
  defaultExpanded = false,
  disabled = false,
  onToggle,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const styles = variantStyles[variant];

  const handleToggle = useCallback(() => {
    if (disabled) return;
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);
  }, [disabled, isExpanded, onToggle]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
    },
    [handleToggle],
  );

  // Generate a unique ID for aria-controls
  const contentId = `expandable-content-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div
      className={[
        'surface-elevated border-theme rounded-lg transition-all duration-300',
        'hover:shadow-lg cursor-pointer select-none',
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80',
        styles.padding,
        className,
      ].join(' ')}
      style={{
        backgroundColor: 'var(--color-surface-elevated)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      aria-expanded={isExpanded}
      aria-controls={contentId}
      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title}`}
      tabIndex={disabled ? -1 : 0}
      role="button"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h2 className={`${styles.titleSize} font-semibold text-primary truncate capitalize`}>
            {title}
          </h2>
          {tag && (
            <span
              className={`${styles.tagSize} text-tertiary px-2 py-1 rounded transition-colors duration-300 flex-shrink-0`}
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-tertiary)',
              }}
            >
              {tag}
            </span>
          )}
        </div>

        {/* Arrow indicator */}
        <div
          className={`flex items-center justify-center w-6 h-6 transition-transform duration-300 ${
            isExpanded ? 'rotate-90' : 'rotate-0'
          }`}
          aria-hidden="true"
        >
          <svg
            className="w-4 h-4 transition-colors duration-200"
            style={{ color: 'var(--color-text-secondary)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Expandable content */}
      <div
        id={contentId}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'opacity-100 visible' : 'max-h-0 opacity-0 invisible'
        }`}
        aria-hidden={!isExpanded}
        style={{
          transitionProperty: 'max-height, opacity, visibility',
        }}
      >
        <div className={isExpanded ? styles.headerMargin : ''}>{children}</div>
      </div>
    </div>
  );
}
