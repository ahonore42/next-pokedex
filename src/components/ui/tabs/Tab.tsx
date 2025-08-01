import { ReactNode } from 'react';
import Button from '../buttons/Button';
import { IconType } from '../icons';

export type TabItem = {
  label: string;
  badge?: number | string;
  disabled?: boolean;
  icon?: IconType;
  content?: ReactNode;
  className?: string;
};

export interface TabProps {
  tab: TabItem;
  isActive: boolean;
  onClick: () => void;
}

export default function Tab({ tab, isActive, onClick }: TabProps) {
  const { label, badge, disabled = false, icon, className = '' } = tab;

  return (
    <div
      className={`
        border-b-2 relative
        ${
          isActive
            ? 'border-indigo-600 dark:border-indigo-700'
            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
        }
        ${className}
      `.trim()}
    >
      <Button
        size="sm"
        variant="tab"
        disabled={disabled}
        onClick={onClick}
        iconLeft={icon}
        className={isActive ? 'text-brand' : ''}
        role="tab"
        aria-selected={isActive}
      >
        {label}
        {badge !== undefined && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-secondary text-subtle rounded-full">
            {badge}
          </span>
        )}
      </Button>
    </div>
  );
}
