import type { NextPage } from 'next';
import type { AppType, AppProps } from 'next/app';
import type { ReactElement, ReactNode } from 'react';

import { ThemeProvider } from '~/lib/contexts/ThemeContext';
import { DefaultLayout } from '~/components/layout/DefaultLayout';
import { trpc } from '~/utils/trpc';
import '~/styles/globals.css';
import '@xyflow/react/dist/style.css';

export type NextPageWithLayout<TProps = Record<string, unknown>, TInitialProps = TProps> = NextPage<
  TProps,
  TInitialProps
> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp = (({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <ThemeProvider defaultTheme="light">{getLayout(<Component {...pageProps} />)}</ThemeProvider>
  );
}) as AppType;

export default trpc.withTRPC(MyApp);
