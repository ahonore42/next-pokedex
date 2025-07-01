import type { ReactNode } from 'react';
import HeaderMenu from '~/components/layout/HeaderMenu';
import FooterMenu from '~/components/layout/FooterMenu';

type DefaultLayoutProps = { children: ReactNode };

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-background)' }}
    >

      <HeaderMenu />

      <div className="mb-4 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 md:py-12 xl:py-16 2xl:py-20 max-w-7xl 2xl:max-w-[1400px] self-center">
        {children}
      </div>

      <FooterMenu />
    </div>
  );
};
