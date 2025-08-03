import { ReactNode } from 'react';
import clsx from 'clsx';

export interface ToolbarGroupProps {
  children: ReactNode;
  label?: string;
  separator?: boolean;
  className?: string;
}

export default function ToolbarGroup({
  children,
  label,
  separator = false,
  className = '',
}: ToolbarGroupProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-2',
        separator && 'border-l border-border pl-2 ml-2',
        className,
      )}
      role={label ? 'group' : undefined}
      aria-label={label}
    >
      {children}
    </div>
  );
}

ToolbarGroup.displayName = 'ToolbarGroup';
