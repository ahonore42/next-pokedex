'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import Dropdown from './dropdowns';
import Icon from './icons';

export type FilterOption<T> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export interface FilterOptionsProps<T> {
  currentFilter?: T; // Current selected filter value
  options: FilterOption<T>[]; // Array of filter options
  onFilterChange: (value: T) => void; // Callback when filter changes
  className?: string; // Additional className for container
  useDropdown?: boolean; // Whether to use enhanced dropdown (default) or native select
  placeholder?: string; // Placeholder text when no option is selected
  disabled?: boolean; // Whether the filter is disabled
}

export default function FilterOptions<T>({
  currentFilter,
  options,
  onFilterChange,
  className = '',
  useDropdown = true,
  placeholder = 'Select option',
  disabled = false,
}: FilterOptionsProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === currentFilter);

  // Native select fallback
  if (!useDropdown) {
    return (
      <div className={clsx('flex items-center gap-2', className)}>
        <select
          value={selectedOption ? String(selectedOption.value) : ''}
          onChange={(e) => {
            const selectedValue = options.find((option) => String(option.value) === e.target.value);
            if (selectedValue) {
              onFilterChange(selectedValue.value);
            }
          }}
          disabled={disabled}
          className="px-3 py-1 text-sm rounded bg-surface-elevated text-primary border border-border transition-theme focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
    );
  }

  // Enhanced dropdown implementation
  const handleOptionSelect = (option: FilterOption<T>) => {
    if (!option.disabled && !disabled) {
      onFilterChange(option.value);
      setIsOpen(false);
    }
  };

  // Trigger button
  const trigger = (
    <button
      type="button"
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      className={clsx(
        'flex items-center justify-between gap-2 px-2 py-1 text-sm',
        'bg-surface-elevated text-primary border border-border rounded',
        'transition-all duration-200',
        'focus:outline-none',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-hover hover:border-brand/50 cursor-pointer',
        'min-w-[120px]',
      )}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-label="Filter options"
    >
      <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
      <Icon
        type="chevron-up"
        size="sm"
        className={clsx('transition-transform duration-200', isOpen ? '-rotate-180' : 'rotate-0')}
      />
    </button>
  );

  // Dropdown content
  const content = (
    <div
      className="py-1 bg-surface rounded-lg shadow-lg border border-border min-w-[120px]"
      role="listbox"
    >
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => handleOptionSelect(option)}
          disabled={option.disabled}
          className={clsx(
            'w-full text-left px-3 py-2 text-sm transition-colors duration-150',
            'focus:outline-none focus:bg-hover',
            option.disabled
              ? 'text-muted cursor-not-allowed opacity-50'
              : 'text-primary hover:bg-hover cursor-pointer',
            currentFilter === option.value && 'bg-brand/10 text-brand font-medium',
          )}
          role="option"
          aria-selected={currentFilter === option.value}
        >
          <div className="flex items-center justify-between">
            <span className="truncate">{option.label}</span>
            {currentFilter === option.value && (
              <Icon type="close" size="sm" className="rotate-45 text-brand" />
            )}
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        trigger={trigger}
        placement="bottom"
        closeOnClickOutside={true}
        closeOnClickInside={true}
        closeOnEscape={true}
      >
        {content}
      </Dropdown>
    </div>
  );
}
