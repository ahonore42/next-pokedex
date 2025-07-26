import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { getBarColor } from '~/utils/pokemon';

export interface HorizontalBarProps {
  value: number;
  maxValue: number;
  color?: string;
  backgroundClassName?: string;
  barHeight: string;
  barClassName?: string;
  hasTextColumns?: boolean;
  getColor?: (value: number, maxValue: number) => string;
  animate?: boolean;
}

export default function HorizontalBar({
  value,
  maxValue,
  color,
  backgroundClassName = 'bg-hover',
  barHeight,
  barClassName = '',
  hasTextColumns = false,
  getColor = getBarColor,
  animate = false,
}: HorizontalBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const barColor = color || getColor(value, maxValue);

  const [animatedPercentage, setAnimatedPercentage] = useState(animate ? 0 : percentage);

  useEffect(() => {
    if (animate) {
      // Use requestAnimationFrame to ensure the initial 0% is rendered before animating
      const timeoutId = requestAnimationFrame(() => {
        setAnimatedPercentage(percentage);
      });
      return () => cancelAnimationFrame(timeoutId);
    }
  }, [animate, percentage]);

  return (
    <div className={hasTextColumns ? 'flex-1' : 'w-full'}>
      <div className="relative">
        <div className={clsx('w-full rounded-sm', backgroundClassName, barHeight)}>
          <div
            className={clsx(
              'rounded-sm transition-all duration-300 ease-out',
              barHeight,
              barColor,
              barClassName,
            )}
            style={{ width: `${animatedPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Display name for debugging
HorizontalBar.displayName = 'HorizontalBar';
