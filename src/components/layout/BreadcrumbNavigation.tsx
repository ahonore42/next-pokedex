'use client';

import Link from 'next/link';

// src/types/breadcrumb.ts

export interface BreadcrumbLink {
  /** The display text for the breadcrumb link */
  label: string;
  /** The href/path for the breadcrumb link */
  href: string;
}

export interface BreadcrumbNavigationProps {
  /** Array of breadcrumb links with href and label */
  links: BreadcrumbLink[];
  /** The current page name that will be rendered as a non-clickable span at the end */
  currentPage: string;
  /** Custom separator between breadcrumbs (default: '/') */
  separator?: string;
  /** Additional CSS classes for the nav element */
  className?: string;
  /** Custom aria-label for the breadcrumb navigation */
  ariaLabel?: string;
}

export default function BreadcrumbNavigation({
  links,
  currentPage,
  separator = '/',
  className = '',
  ariaLabel = 'Breadcrumb navigation',
}: BreadcrumbNavigationProps) {
  return (
    <nav className={`mb-6 ${className}`} aria-label={ariaLabel}>
      <div className="flex items-center space-x-2 text-sm">
        {/* Map through the links array */}
        {links.map((link, index) => (
          <div key={`${link.href}-${index}`} className="flex items-center space-x-2">
            <Link href={link.href} className="text-brand hover:text-brand-hover font-medium">
              {link.label}
            </Link>
            {/* Separator after each link */}
            <span aria-hidden="true" className="text-muted">
              {separator}
            </span>
          </div>
        ))}

        {/* Current page - always rendered as non-clickable span */}
        <span aria-current="page" className="text-muted font-medium">
          {currentPage}
        </span>
      </div>
    </nav>
  );
}
