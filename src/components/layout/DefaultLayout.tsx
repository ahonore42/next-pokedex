import type { ReactNode } from 'react';
import HeaderMenu from '~/components/layout/HeaderMenu';
import FooterMenu from '~/components/layout/FooterMenu';
import Pokeball from '~/components/ui/Pokeball';
import { useLoading } from '~/lib/contexts/LoadingContext';

type DefaultLayoutProps = {
  children: ReactNode;
  isLoading?: boolean;
};

export default function DefaultLayout({ children, isLoading = false }: DefaultLayoutProps) {
  const { isGlobalLoading, isPageLoading } = useLoading();

  // Determine if we should show loading state
  const shouldShowLoading = isLoading || isGlobalLoading || isPageLoading;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HeaderMenu />

      {/* Main content area with consistent dimensions */}
      <main className="flex-grow w-full min-w-[360px] mb-4 mx-auto px-4 py-8 lg:py-12 max-w-7xl xl:max-w-[1440px] self-center relative">
        {/* Loading overlay - positioned absolutely to prevent layout shifts */}
        {shouldShowLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <Pokeball size="xl" endlessSpin spinSpeed={1.5} />
          </div>
        )}

        {/* Content container - always present to maintain layout dimensions */}
        <div
          className={`transition-opacity duration-200 ${shouldShowLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          {children}
        </div>
      </main>

      <FooterMenu />
    </div>
  );
}
