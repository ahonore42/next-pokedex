import Link from 'next/link';
import { AllTypesOutput } from '~/server/routers/_app';
import { getTypeColor, truncateTypeName } from '~/utils/pokemon';

export interface TypeBadgeProps {
  type: AllTypesOutput[number];
  link?: boolean;
  short?: boolean;
}

export default function TypeBadge({ type, link = true, short }: TypeBadgeProps) {
  const color = getTypeColor(type.name);
  const typeName = type.names[0]?.name ?? type.name;
  const nameLength = short ? 'short' : 'medium';
  const displayName = truncateTypeName(typeName, nameLength);

  const badgeContent = (
    <span
      className={`flex items-center justify-center px-2 py-0.5 text-xs rounded text-white font-medium capitalize shadow-xs ${nameLength === 'medium' ? 'w-14' : 'h-12 w-12'}`}
      style={{
        backgroundColor: color,
      }}
    >
      {displayName}
    </span>
  );

  if (link) {
    return (
      <Link href={`/pokemon-types/${type.name}`} className="hover:scale-105 interactive-transition">
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}
