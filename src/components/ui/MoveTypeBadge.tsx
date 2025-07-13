import { getDamageClassColor, getDamageClassIcon } from '~/utils/pokemon';
import { capitalizeName } from '~/utils/text';

interface MoveTypeBadgeProps {
  moveDamageClass: {
    id: number;
    name: string;
    names: { name: string }[];
  };
}

export const MoveTypeBadge: React.FC<MoveTypeBadgeProps> = ({ moveDamageClass }) => {
  const displayName = moveDamageClass.names[0]?.name || capitalizeName(moveDamageClass.name);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getDamageClassColor(moveDamageClass.name)}`}
    >
      <span>{getDamageClassIcon(moveDamageClass.name)}</span>
      <span>{displayName}</span>
    </span>
  );
};