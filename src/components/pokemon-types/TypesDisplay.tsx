import { pokemonTypes } from '~/utils/pokemon';
import TypeBadge from '~/components/pokemon-types/TypeBadge';

interface TypesDisplayProps {
  link?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function TypesDisplay({ link = false, onClick, className }: TypesDisplayProps) {
  const interactive = onClick || link;
  return (
    <div
      className={`py-4 flex flex-wrap gap-2 justify-center ${interactive && 'cursor-pointer'} ${className}`}
    >
      {pokemonTypes.map((type, index) => (
        <span onClick={onClick}>
          <TypeBadge key={`${type}_${index}`} type={type} link={link} />
        </span>
      ))}
    </div>
  );
}
