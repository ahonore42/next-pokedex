import Link from 'next/link';
import { ReactNode, useEffect } from 'react';
import Icon from './icons';
import SkeletonInteractiveLink from './skeletons/SkeletonInteractiveLink';

interface InteractiveLinkProps {
  href: string;
  icon?: ReactNode;
  title?: string;
  description?: ReactNode | string;
  showArrow?: boolean;
  ariaLabel: string;
  height: 'sm' | 'md' | 'lg';
  className?: string;
  children?: ReactNode;
  loading?: boolean;
  onDataLoad?: () => void;
}

export default function InteractiveLink({
  href,
  icon,
  title,
  description,
  showArrow = false,
  ariaLabel,
  height = 'md',
  className = '',
  children,
  loading = false,
  onDataLoad,
}: InteractiveLinkProps) {
  // Call onDataLoad when not loading
  useEffect(() => {
    if (onDataLoad) {
      onDataLoad();
    }
  }, [onDataLoad]);

  // Show skeleton while loading
  if (loading) {
    return <SkeletonInteractiveLink height={height} className={className} />;
  }

  const containerHeights = {
    sm: 'h-20',
    md: 'h-24',
    lg: 'h-36',
  };

  return (
    <Link
      href={href}
      className={`
        ${containerHeights[height]}
        relative
        group block border
        pokemon card
        interactive-link
        transition-interactive
        ${className}
      `}
      aria-label={ariaLabel}
    >
      <div className="flex items-start gap-2">
        {icon && <div className="group-hover:scale-110 transition-interactive">{icon}</div>}
        <div className="flex flex-col transition-interactive">
          {title && <h3 className="font-semibold text-primary group-hover:text-brand">{title}</h3>}
          {children && children}
          {description && (
            <span className="text-sm text-muted group-hover:text-muted">{description}</span>
          )}
        </div>
      </div>
      {showArrow && (
        <div className="absolute right-2">
          <Icon
            type="chevron-right"
            className="text-muted group-hover:text-brand transform group-hover:translate-x-1 transition-interactive"
          />
        </div>
      )}
    </Link>
  );
}
