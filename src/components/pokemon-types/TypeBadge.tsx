import Link from 'next/link';
import { AllTypesOutput } from '~/server/routers/_app';
import { getTypeColor, truncateTypeName } from '~/utils/pokemon';

export interface TypeBadgeProps {
  type: AllTypesOutput[number];
  link?: boolean;
  square?: boolean;
  compact?: boolean;
}

export default function TypeBadge({ type, link = true, square, compact = false }: TypeBadgeProps) {
  const color = getTypeColor(type.name);
  const typeName = type.names[0]?.name ?? type.name;
  const nameLength = square ? 'short' : 'medium';
  const displayName = truncateTypeName(typeName, nameLength);

  const badgeContent = (
    <span
      className={`flex items-center justify-center text-white font-medium capitalize shadow-xs text-xs
        ${square ? 'h-12 w-12' : 'w-14 rounded'} ${compact ? 'leading-none py-0.5' : 'px-2 py-0.5  '}
        `}
      style={{
        backgroundColor: color,
      }}
    >
      {displayName}
    </span>
  );

  if (link) {
    return (
      <Link href={`/pokemon-types/${type.name}`} className="hover:scale-105 transition-interactive">
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}
