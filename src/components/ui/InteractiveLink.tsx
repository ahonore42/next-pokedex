import Link from 'next/link';
import { ReactNode } from 'react';

interface InteractiveLinkProps {
  href: string;
  icon?: ReactNode;
  title: string;
  description?: ReactNode | string;
  showArrow?: boolean;
  ariaLabel: string;
  className?: string;
}

export default function InteractiveLink({
  href,
  icon,
  title,
  description,
  showArrow = false,
  ariaLabel,
  className = '',
}: InteractiveLinkProps) {
  return (
    <Link
      href={href}
      className={`
        group block p-4 border rounded-lg
        bg-pokemon hover:bg-pokemon-hover
        border-pokemon-border hover:border-pokemon-border-hover
        hover:shadow-md hover:-translate-y-1
        active:scale-95
        transition-all duration-300
        contain-layout
        ${className}
      `}
      aria-label={ariaLabel}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 group-hover:scale-110 interactive-transition">{icon}</div>
        )}

        <div className="flex-1 min-w-0 interactive-transition">
          <div className="font-semibold text-pokemon-text mb-1">
            {title}
          </div>

          {description && (
            <div className="text-sm text-pokemon-text-muted group-hover:text-muted">
              {description}
            </div>
          )}
        </div>
      </div>

      {showArrow && (
        <div className="flex justify-end mt-2">
          <svg
            className="w-4 h-4 text-pokemon-text-muted group-hover:text-brand transform group-hover:translate-x-1 interactive-transition"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </Link>
  );
}
