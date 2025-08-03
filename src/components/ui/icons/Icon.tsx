import { iconMap } from './BaseIcons';
import { IconSize, IconType } from './icons.config';

export interface IconProps {
  type: IconType;
  size?: IconSize;
  className?: string;
}

/**
 * Generic Icon component that renders icons based on type prop
 *
 * @example
 * <Icon type="plus" size="lg" />
 * <Icon type="loading" size="sm" className="text-blue-500" />
 */
export default function Icon({ type, size = 'md', className }: IconProps) {
  const IconComponent = iconMap[type];

  if (!IconComponent) {
    console.warn(`Icon type "${type}" not found in iconMap`);
    return null;
  }

  return <IconComponent size={size} className={className} />;
}
