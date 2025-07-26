import { clsx } from 'clsx';
import HorizontalBar from './HorizontalBar';

export type TextColumnItem = {
  value: string | number;
  className?: string;
  width?: string;
};

export type BarData = {
  id: string | number;
  value: number;
  color?: string;
  maxValue?: number;
  textColumns?: TextColumnItem[];
};

export interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  variant?: 'default' | 'compact';
  className?: string;
  barClassName?: string;
  backgroundClassName?: string;
  animate?: boolean;
}

export default function BarChart({
  data,
  maxValue,
  variant = 'default',
  className = '',
  barClassName = '',
  backgroundClassName = 'bg-hover',
  animate = false,
}: BarChartProps) {
  // Variant system for consistent sizing
  const variantStyles = {
    default: {
      container: 'text-sm space-y-2',
      barHeight: 'h-4',
      spacing: 'gap-4',
    },
    compact: {
      container: 'text-xs space-y-1',
      barHeight: 'h-3',
      spacing: 'gap-2',
    },
  } as const;

  const styles = variantStyles[variant];

  // Calculate global max value if not provided
  const globalMaxValue = maxValue || Math.max(...data.map((item) => item.maxValue || item.value));

  // Determine if we should show text elements
  const hasTextColumns = data.some((item) => item.textColumns && item.textColumns.length > 0);
  const containerClassName = hasTextColumns ? styles.container : 'space-y-1';

  return (
    <div className={clsx(containerClassName, className)}>
      {data.map((item) => (
        <div
          key={item.id}
          className={clsx(hasTextColumns ? `flex items-center ${styles.spacing}` : 'relative')}
        >
          {/* Text Columns */}
          {item.textColumns?.map((textColumn, index) => (
            <div key={index} className={clsx(textColumn.width || 'w-10', textColumn.className)}>
              <span>{textColumn.value}</span>
            </div>
          ))}

          {/* Bar */}
          <HorizontalBar
            value={item.value}
            maxValue={item.maxValue || globalMaxValue}
            color={item.color}
            backgroundClassName={backgroundClassName}
            barHeight={styles.barHeight}
            barClassName={barClassName}
            hasTextColumns={hasTextColumns}
            animate={animate}
          />
        </div>
      ))}
    </div>
  );
}

// Display name for debugging
BarChart.displayName = 'BarChart';
