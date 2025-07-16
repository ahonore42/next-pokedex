import { getDamageClassColor, getDamageClassIcon } from '~/utils/pokemon';

interface MoveTypeBadgeProps {
  moveDamageClass: {
    id: number;
    name: string;
    names: { name: string }[];
  };
}

export const MoveTypeBadge: React.FC<MoveTypeBadgeProps> = ({ moveDamageClass }) => {
  const displayName = moveDamageClass.names[0]?.name || moveDamageClass.name;
  const damageClassColor = getDamageClassColor(moveDamageClass.name);
  const damageClassIcon = getDamageClassIcon(moveDamageClass.name);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${damageClassColor}`}
    >
      <span>{damageClassIcon}</span>
      <span className="capitalize">{displayName}</span>
    </span>
  );
};
