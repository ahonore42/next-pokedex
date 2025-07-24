import React, { ReactNode } from 'react';
import { clsx } from 'clsx';
import Icon, { IconType } from '../icons';
import { sizeVariants, ButtonSize } from './button-variants';

interface ButtonContentProps {
  children: ReactNode;
  size: ButtonSize;
  loading: boolean;
  iconLeft?: IconType;
  iconRight?: IconType;
}

export const ButtonContent: React.FC<ButtonContentProps> = ({
  children,
  size,
  loading,
  iconLeft,
  iconRight,
}) => {
  // Get the appropriate icon size for this button size
  const iconSize = sizeVariants[size as keyof typeof sizeVariants].iconSize;

  return (
    <>
      {/* Left icon or loading spinner */}
      {loading ? (
        <Icon type="loading" size={iconSize} />
      ) : (
        iconLeft && <Icon type={iconLeft} size={iconSize} />
      )}

      {/* Button content */}
      <span className={clsx(loading && 'opacity-70')}>{children}</span>

      {/* Right icon (not shown when loading) */}
      {!loading && iconRight && <Icon type={iconRight} size={iconSize} />}
    </>
  );
};

export default ButtonContent;
