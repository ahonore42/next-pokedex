export interface FilterOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface FilterOptionsProps<T> {
  /** Current selected filter value */
  currentFilter?: T;
  /** Array of filter options */
  options: FilterOption<T>[];
  /** Callback when filter changes */
  onFilterChange: (value: T) => void;
  /** Additional className for container */
  className?: string;
}

export default function FilterOptions<T>({
  currentFilter,
  options,
  onFilterChange,
  className = '',
}: FilterOptionsProps<T>) {
  const selectedOption = options.find((option) => option.value === currentFilter);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2">
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
    </div>
  );
}
