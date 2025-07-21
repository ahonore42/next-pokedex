import React from 'react';
import TypeBadge, { TypeBadgeProps } from './TypeBadge';

interface TypeBadgesDisplayProps {
  types: TypeBadgeProps[];
  link?: boolean;
  compact?: boolean;
  className?: string;
}

export default function TypeBadgesDisplay({
  types,
  link = false,
  compact,
  className = '',
}: TypeBadgesDisplayProps) {
  if (!types || types.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex w-fit justify-center flex-nowrap mt-1 ${compact ? 'gap-1' : 'gap-2'} ${className}`}
    >
      {types.map((typeInfo) => (
        <div key={typeInfo.type.id}>
          <TypeBadge type={typeInfo.type} link={link} compact={compact} />
        </div>
      ))}
    </div>
  );
}
