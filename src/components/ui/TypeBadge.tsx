import Link from 'next/link';
import { getTypeColor } from '~/utils/pokemon';

interface TypeBadgeProps {
  type: {
    id: number;
    name: string;
    names: { name: string }[];
  };
  link?: boolean;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, link=true }) => {
  const color = getTypeColor(type.name);
  const displayName = type.names[0]?.name ?? type.name;

  const getTruncatedName = (name: string) => {
    switch (name.toLowerCase()) {
      case 'fighting':
        return 'FIGHT';
      case 'electric':
        return 'ELECTR';
      case 'psychic':
        return 'PSYCHC';
      default:
        return name.length > 6 ? name.substring(0, 6).toUpperCase() : name.toUpperCase();
    }
  };

  const badgeContent = (
    <span
      className="w-14 flex items-center justify-center px-2 py-0.5 text-xs rounded text-white font-medium capitalize"
      style={{
        backgroundColor: color,
      }}
    >
      {getTruncatedName(displayName)}
    </span>
  );

  if (link) {
    return (
      <Link
        href={`/pokemon-types/${type.name}`}
        className="hover:scale-105 transition-transform duration-200"
      >
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
};
