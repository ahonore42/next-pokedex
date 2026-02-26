import type { ReactNode } from 'react';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/router';
import HeaderMenu from '~/components/layout/HeaderMenu';
import FooterMenu from './footer';
import Pokeball from '~/components/ui/Pokeball';

// Pages call usePageLoading(isLoading) to drive the layout spinner.
// The layout keeps the page component mounted so hooks keep running, but
// hides it (display:none) until loading is complete.
// eslint-disable-next-line @typescript-eslint/no-empty-function
const PageLoadingContext = createContext<(loading: boolean) => void>(() => {});

export function usePageLoading(isLoading: boolean) {
  const setLoading = useContext(PageLoadingContext);
  useEffect(() => {
    setLoading(isLoading);
    return () => setLoading(false);
  }, [isLoading, setLoading]);
}

type DefaultLayoutProps = {
  children: ReactNode;
};

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  const router = useRouter();
  const [isRouteLoading, setRouteLoading] = useState(false);
  const [isPageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setRouteLoading(true);
      setPageLoading(false);
    };
    const handleRouteChangeComplete = () => requestAnimationFrame(() => setRouteLoading(false));
    const handleRouteChangeError = () => setRouteLoading(false);

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router.events]);

  const setPageLoadingCallback = useCallback((loading: boolean) => {
    setPageLoading(loading);
  }, []);

  const shouldShowLoading = isRouteLoading || isPageLoading;

  return (
    <PageLoadingContext.Provider value={setPageLoadingCallback}>
      <div className="flex flex-col min-h-dvh bg-background min-w-[360px]">
        <HeaderMenu />

        <main className="flex-grow w-full mx-auto px-4 pt-4 pb-8 lg:pt-8 lg:pb-12 max-w-7xl xl:max-w-[1536px] self-center flex flex-col">
          {/* Always keep children mounted so hooks (incl. usePageLoading) continue to run.
              Hide them visually while the layout spinner is active. */}
          <div className={shouldShowLoading ? 'hidden' : 'contents'}>
            {children}
          </div>

          {shouldShowLoading && (
            <div className="flex-grow flex items-center justify-center">
              <Pokeball size="lg" endlessSpin spinSpeed={3} />
            </div>
          )}
        </main>

        <FooterMenu />
      </div>
    </PageLoadingContext.Provider>
  );
}
