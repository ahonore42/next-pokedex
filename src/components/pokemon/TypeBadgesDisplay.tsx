import React from 'react';
import { TypeBadge, TypeBadgeProps } from '../ui/TypeBadge';

interface TypeBadgesDisplayProps {
  types: TypeBadgeProps[];
  link?: boolean;
  className?: string;
}

const TypeBadgesDisplay: React.FC<TypeBadgesDisplayProps> = ({
  types,
  link = false,
  className = '',
}) => {
  const styles = {
    container: 'gap-0 sm:gap-2',
    scale: 'transform scale-90 sm:scale-100',
  };

  if (!types || types.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex w-fit min-w-24 justify-center flex-nowrap mt-1 px-1 ${styles.container} ${className}`}
    >
      {types.map((typeInfo) => (
        <div key={typeInfo.type.id} className={styles.scale}>
          <TypeBadge type={typeInfo.type} link={link} />
        </div>
      ))}
    </div>
  );
};

export default TypeBadgesDisplay;
