import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import BreadcrumbNavigation, { BreadcrumbLink } from './BreadcrumbNavigation';
import { clsx } from 'clsx';

export interface PageHeadingProps {
  // Essential SEO
  pageTitle: string;
  metaDescription: string;
  useCanonical?: boolean; // Automatically generate canonical URL from current route
  ogImage?: string;

  // Structured data (huge SEO impact)
  schemaType?: 'WebPage' | 'Article';

  // Breadcrumb navigation
  breadcrumbLinks: BreadcrumbLink[];
  currentPage: string;

  // Visual content
  title: string;
  titleMetadata?: string | React.ReactNode;
  subtitle?: string;
  titleAlignment?: 'left' | 'right';
  className?: string;
  titleId?: string;
}

export default function PageHeading({
  // Essential SEO
  pageTitle,
  metaDescription,
  useCanonical = true,
  ogImage,
  schemaType = 'WebPage',

  // Navigation & Visual
  breadcrumbLinks,
  currentPage,
  title,
  titleMetadata,
  subtitle,
  titleAlignment = 'right',
  className = '',
  titleId,
}: PageHeadingProps) {
  const router = useRouter();

  // Generate full canonical URL from current route
  const canonicalUrl =
    useCanonical && typeof window !== 'undefined'
      ? new URL(router.asPath, window.location.origin).toString()
      : undefined;

  // Generate breadcrumb structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      ...breadcrumbLinks.map((link, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: link.label,
        item:
          typeof window !== 'undefined'
            ? new URL(link.href, window.location.origin).toString()
            : link.href,
      })),
      {
        '@type': 'ListItem',
        position: breadcrumbLinks.length + 1,
        name: currentPage,
      },
    ],
  };

  // Generate main structured data
  const mainSchema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: title,
    headline: pageTitle,
    description: metaDescription,
    ...(ogImage && { image: ogImage }),
    ...(canonicalUrl && { url: canonicalUrl }),
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(mainSchema) }}
        />
      </Head>

      <div className={clsx('flex justify-between items-start', className)}>
        <div className="flex-shrink-0 self-end">
          <BreadcrumbNavigation links={breadcrumbLinks} currentPage={currentPage} />
        </div>

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
