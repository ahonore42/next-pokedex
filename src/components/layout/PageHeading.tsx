import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import BreadcrumbNavigation, { BreadcrumbLink } from './BreadcrumbNavigation';

export interface PageHeadingProps {
  // Essential SEO
  pageTitle: string;
  metaDescription: string;
  useCanonical?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article';

  // Structured data (huge SEO impact)
  schemaType?: 'WebSite' | 'WebPage' | 'Article';
  jsonLd?: Record<string, any>;

  // Multi-language SEO
  alternateUrls?: { href: string; hreflang: string }[];

  // Breadcrumb navigation (SEO + UX)
  breadcrumbLinks?: BreadcrumbLink[];
  currentPage: string;

  // Visual content
  title?: string;
  subtitle?: string;
  className?: string;
  titleId?: string;
}

export default function PageHeading({
  // Essential SEO
  pageTitle,
  metaDescription,
  useCanonical = true,
  ogImage,
  ogType = 'website',
  schemaType = 'WebPage',
  jsonLd,
  alternateUrls,

  // Navigation & Visual
  breadcrumbLinks,
  currentPage,
  title,
  subtitle,
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
  const breadcrumbSchema = breadcrumbLinks && {
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
  const mainSchema = jsonLd || {
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

        {/* Alternate URLs for multi-language */}
        {alternateUrls?.map(({ href, hreflang }) => (
          <link key={hreflang} rel="alternate" hrefLang={hreflang} href={href} />
        ))}

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content={ogType} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}

        {/* Structured Data */}
        {breadcrumbSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(mainSchema) }}
        />
      </Head>

      {title && (
        <div className={className}>
          {/* Top row: Breadcrumbs and Title aligned at bottom */}
          <div className="flex justify-between items-end">
            {breadcrumbLinks && (
              <div className="flex-shrink-0 hidden md:block">
                <BreadcrumbNavigation links={breadcrumbLinks} currentPage={currentPage} />
              </div>
            )}

            <div className="flex items-end justify-end space-x-3">
              <h1 id={titleId} className="text-4xl font-bold capitalize indigo-gradient">
                {title}
              </h1>
            </div>
          </div>

          {/* Bottom row: Subtitle */}
          {subtitle && (
            <div className="text-right">
              <p className="text-lg font-base text-subtle">{subtitle}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
