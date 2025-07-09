import Link from 'next/link';
import { getTypeColor } from '~/utils/pokemon';

interface TypeBadgeProps {
  type: {
    id: number;
    name: string;
    names: { name: string }[];
  };
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const color = getTypeColor(type.name);
  const displayName = type.names[0]?.name ?? type.name;

  return (
    <Link
      href={`/types/${type.name}`}
      className="px-2 py-0.5 text-xs rounded text-white font-medium hover:scale-105 transition-transform duration-200 capitalize"
      style={{
        backgroundColor: color,
      }}
    >
      {displayName.toUpperCase()}
    </Link>
  );
};
