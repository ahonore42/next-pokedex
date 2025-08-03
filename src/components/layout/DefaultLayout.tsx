import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import HeaderMenu from '~/components/layout/HeaderMenu';
import FooterMenu from './footer';
import Pokeball from '~/components/ui/Pokeball';

type DefaultLayoutProps = {
  children: ReactNode;
  isLoading?: boolean;
};

export default function DefaultLayout({ children, isLoading = false }: DefaultLayoutProps) {
  const router = useRouter();
  const [isRouteLoading, setRouteLoading] = useState(false);

  // Handle route change loading states
  useEffect(() => {
    const handleRouteChangeStart = () => setRouteLoading(true);
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

  const shouldShowLoading = isLoading || isRouteLoading;

  return (
    <div className="flex flex-col min-h-dvh bg-background min-w-[360px]">
      <HeaderMenu />

      <main className="flex-grow w-full mx-auto px-4 pt-4 pb-8 lg:pt-8 lg:pb-12 max-w-7xl xl:max-w-[1536px] self-center flex flex-col">
        {shouldShowLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <Pokeball size="lg" endlessSpin spinSpeed={3} />
          </div>
        ) : (
          children
        )}
      </main>

      <FooterMenu />
    </div>
  );
}
