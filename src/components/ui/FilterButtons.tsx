'use client';

export interface FilterOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface FilterButtonsProps<T> {
  /** Current selected filter value */
  currentFilter?: T;
  /** Array of filter options */
  options: FilterOption<T>[];
  /** Callback when filter changes */
  onFilterChange: (value: T) => void;
  /** Custom label text before buttons */
  label?: string;
  /** Additional className for container */
  className?: string;
}

export default function FilterButtons<T>({
  currentFilter,
  options,
  onFilterChange,
  label = 'Filter:',
  className = '',
}: FilterButtonsProps<T>) {
  const selectedOption = options.find((option) => option.value === currentFilter);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className="text-sm text-muted">{label}</span>}

      {/* Mobile Dropdown (below md) */}
      <div className="block md:hidden">
        <select
          value={selectedOption ? String(selectedOption.value) : ''}
          onChange={(e) => {
            const selectedValue = options.find((option) => String(option.value) === e.target.value);
            if (selectedValue) {
              onFilterChange(selectedValue.value);
            }
          }}
          className="px-3 py-1 text-sm rounded bg-surface-elevated text-primary border border-border transition-theme focus:outline-none"
        >
          {options.map((option) => (
            <option
              key={String(option.value)}
              value={String(option.value)}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Buttons (md and above) */}
      <div className="hidden md:flex items-center gap-2">
        {options.map((option) => {
          const isSelected = currentFilter === option.value;

          return (
            <button
              key={String(option.value)}
              onClick={() => onFilterChange(option.value)}
              disabled={option.disabled}
              className={`
                cursor-pointer px-3 py-1 text-sm rounded transition-theme whitespace-nowrap
                ${
                  isSelected
                    ? 'bg-hover text-primary'
                    : 'bg-surface-elevated hover:bg-hover text-muted hover:text-primary'
                }
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
