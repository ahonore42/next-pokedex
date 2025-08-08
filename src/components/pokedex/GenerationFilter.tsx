import React from 'react';

interface GenerationFilterProps {
  title: string;
  selectedGenerationId: number;
  setSelectedGenerationId: (id: number) => void;
  availableGenerations: number[];
  titleClassName?: string;
  className?: string;
}

// Filter content by Pokemon generation
export default function GenerationFilter({
  title,
  selectedGenerationId,
  setSelectedGenerationId,
  availableGenerations,
  titleClassName = 'text-md font-bold text-primary',
  className = '',
}: GenerationFilterProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 ${className}`}
    >
      <h2 className={`${titleClassName} mb-4 sm:mb-0`}>{title}</h2>

      {/* Generation Selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="generation-select" className="text-sm font-medium text-muted">
          Generation:
        </label>
        <select
          id="generation-select"
          value={selectedGenerationId}
          onChange={(e) => setSelectedGenerationId(Number(e.target.value))}
          className="px-3 py-1 border border-border rounded-md bg-secondary text-primary text-sm focus:outline-none"
        >
          {availableGenerations.map((genId) => (
            <option key={genId} value={genId}>
              {`Generation ${genId}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
