import Button from '.';

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
  /** Additional className for container */
  className?: string;
}

export default function FilterButtons<T>({
  currentFilter,
  options,
  onFilterChange,
  className = '',
}: FilterButtonsProps<T>) {
  const selectedOption = options.find((option) => option.value === currentFilter);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Mobile Dropdown (below md) */}
      <div className="block md:hidden flex items-center gap-2">
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
            <Button
              key={String(option.value)}
              size="xs"
              variant={isSelected ? 'outline' : 'secondary'}
              active={isSelected}
              disabled={option.disabled}
              onClick={() => onFilterChange(option.value)}
              className="whitespace-nowrap"
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
