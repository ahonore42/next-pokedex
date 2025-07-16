import React from 'react';
import Head from 'next/head';
import BreadcrumbNavigation, { BreadcrumbLink } from './BreadcrumbNavigation';
import { clsx } from 'clsx';

export interface PageHeadingProps {
  // SEO & Head management
  pageTitle: string; // Used in <title> tag
  metaDescription: string;
  ogTitle?: string; // Defaults to pageTitle
  ogDescription?: string; // Defaults to metaDescription
  ogImage?: string;
  additionalMeta?: React.ReactNode; // For custom meta tags

  // Breadcrumb navigation
  breadcrumbLinks: BreadcrumbLink[];
  currentPage: string;
  breadcrumbClassName?: string;

  // Visual content
  title: string; // Display title (can differ from pageTitle)
  titleMetadata?: string | React.ReactNode; // "#001", badges, etc.
  subtitle?: string;

  // Layout options
  titleAlignment?: 'left' | 'right';
  className?: string;

  // Accessibility
  titleId?: string; // For linking aria-describedby
}

export default function PageHeading({
  // SEO props
  pageTitle,
  metaDescription,
  ogTitle,
  ogDescription,
  ogImage,
  additionalMeta,

  // Breadcrumb props
  breadcrumbLinks,
  currentPage,
  breadcrumbClassName,

  // Visual props
  title,
  titleMetadata,
  subtitle,

  // Layout props
  titleAlignment = 'right',
  className = '',
  titleId,
}: PageHeadingProps) {
  // Default OG values to main values if not provided
  const finalOgTitle = ogTitle || pageTitle;
  const finalOgDescription = ogDescription || metaDescription;

  return (
    <>
      {/* Next.js Head for SEO */}
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />

        {/* Open Graph meta tags */}
        <meta property="og:title" content={finalOgTitle} />
        <meta property="og:description" content={finalOgDescription} />
        {ogImage && <meta property="og:image" content={ogImage} />}

        {/* Twitter Card meta tags */}
        <meta name="twitter:title" content={finalOgTitle} />
        <meta name="twitter:description" content={finalOgDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        <meta name="twitter:card" content="summary_large_image" />

        {/* Additional custom meta tags */}
        {additionalMeta}
      </Head>

      {/* Visual Page Heading */}
      <div className={clsx('flex justify-between items-start', className)}>
        {/* Left Column - Breadcrumb Navigation */}
        <div className="flex-shrink-0 self-end">
          <BreadcrumbNavigation
            links={breadcrumbLinks}
            currentPage={currentPage}
            className={breadcrumbClassName}
          />
        </div>

        {/* Right Column - Title and Info */}
        <div className={clsx('flex-1', titleAlignment === 'left' ? 'text-left' : 'text-right')}>
          <div
            className={clsx(
              'flex items-center space-x-3 mb-2',
              titleAlignment === 'left' ? 'justify-start' : 'justify-end',
            )}
          >
            <h1 id={titleId} className="text-4xl font-bold capitalize text-primary">
              {title}
            </h1>

            {titleMetadata && (
              <div className="text-2xl font-semibold text-muted">{titleMetadata}</div>
            )}
          </div>

          {subtitle && <p className="text-lg text-subtle mb-4">{subtitle}</p>}
        </div>
      </div>
    </>
  );
}
