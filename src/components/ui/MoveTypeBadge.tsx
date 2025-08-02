import { getDamageClassColor, getDamageClassIcon } from '~/utils/pokemon';
import Badge from './Badge';

interface MoveTypeBadgeProps {
  damageClass: string;
}

export default function MoveTypeBadge({ damageClass }: MoveTypeBadgeProps) {
  const damageClassColor = getDamageClassColor(damageClass);
  const damageClassIcon = getDamageClassIcon(damageClass);
  const truncatedName = damageClass.slice(0, 4);
  return (
    <Badge className={`${damageClassColor}`}>
      <span>{damageClassIcon}</span>
      <span className='text-gray-100'>{truncatedName}</span>
    </Badge>
  );
}

export const renderMoveTypeBadge = ({ damageClass }: MoveTypeBadgeProps) => (
  <MoveTypeBadge damageClass={damageClass} />
);
