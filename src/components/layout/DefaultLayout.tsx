import type { ReactNode } from 'react';
import HeaderMenu from '~/components/layout/HeaderMenu';
import FooterMenu from '~/components/layout/FooterMenu';

type DefaultLayoutProps = { children: ReactNode };

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HeaderMenu />
      <div className="flex-grow w-full min-w-[360px] mb-4 mx-auto px-4 py-8 lg:py-12 max-w-7xl xl:max-w-[1440px] self-center">
        {' '}
        {children}
      </div>
      <FooterMenu />
    </div>
  );
};
