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
      className="flex items-center justify-center px-4 py-2 rounded-full text-white font-bold text-center shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 capitalize"
      style={{ backgroundColor: color }}
    >
      {displayName}
    </Link>
  );
};
