import { clsx } from 'clsx';

type Metric = {
  label: string;
  value: string | number;
  color?: 'primary' | 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'custom';
  customColorClass?: string;
};

type GridColumns = {
  default: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
};

interface MetricsGridProps {
  metrics: Metric[];
  columns?: GridColumns;
  className?: string;
  variant?: 'default' | 'compact';
  containerClassName?: string;
}

export default function MetricsGrid({
  metrics,
  columns = { default: 2, sm: 4 },
  className = '',
  variant = 'default',
  containerClassName = '',
}: MetricsGridProps) {
  // Variant system for consistent sizing
  const variantStyles = {
    default: {
      valueSize: 'text-xl',
      labelSize: 'text-sm',
      spacing: 'gap-4',
    },
    compact: {
      valueSize: 'text-lg',
      labelSize: 'text-xs',
      spacing: 'gap-3',
    },
  } as const;

  // Color system matching your existing patterns
  const colorStyles = {
    primary: 'text-primary',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    custom: '', // Will use customColorClass
  } as const;

  const styles = variantStyles[variant];

  // Build responsive grid classes
  const getGridClasses = () => {
    const gridClasses = [`grid-cols-${columns.default}`];

    if (columns.sm) gridClasses.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) gridClasses.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) gridClasses.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) gridClasses.push(`xl:grid-cols-${columns.xl}`);
    if (columns['2xl']) gridClasses.push(`2xl:grid-cols-${columns['2xl']}`);

    return gridClasses.join(' ');
  };

  // Get value color class for each metric
  const getValueColorClass = (metric: Metric) => {
    if (metric.color === 'custom' && metric.customColorClass) {
      return metric.customColorClass;
    }
    return colorStyles[metric.color || 'primary'];
  };

  return (
    <div className={clsx('grid text-center', getGridClasses(), styles.spacing, containerClassName)}>
      {metrics.map((metric, index) => (
        <div key={`${metric.label}-${index}`} className={className}>
          <p className={clsx(styles.labelSize, 'text-subtle')}>{metric.label}</p>
          <p className={clsx(styles.valueSize, 'font-bold', getValueColorClass(metric))}>
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// Display name for debugging
MetricsGrid.displayName = 'MetricsGrid';
