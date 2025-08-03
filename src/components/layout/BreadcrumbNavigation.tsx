'use client';

import Link from 'next/link';

export interface BreadcrumbLink {
  label: string; // The display text for the breadcrumb link
  href: string; // The href/path for the breadcrumb link
}

export interface BreadcrumbNavigationProps {
  links: BreadcrumbLink[]; // Array of breadcrumb links with href and label
  currentPage: string; // The current page name that will be rendered as a non-clickable span at the end
  separator?: string; // Custom separator between breadcrumbs (default: '/')
  className?: string; // Additional CSS classes for the nav element
  ariaLabel?: string; // Custom aria-label for the breadcrumb navigation
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
