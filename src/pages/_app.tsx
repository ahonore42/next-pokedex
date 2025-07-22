import type { NextPage } from 'next';
import type { AppType, AppProps } from 'next/app';
import Head from 'next/head';
import '~/styles/globals.css';
import '@xyflow/react/dist/style.css';

import { ThemeProvider } from 'next-themes';
import { trpc } from '~/utils/trpc';
import DefaultLayout from '~/components/layout/DefaultLayout';

export type NextPageWithLayout<TProps = Record<string, unknown>, TInitialProps = TProps> = NextPage<
  TProps,
  TInitialProps
>;

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp = (({ Component, pageProps }: AppPropsWithLayout) => {
  return (
    <>
      <Head>
        {/* Preconnect to GitHub CDN */}
        <link rel="preconnect" href="https://raw.githubusercontent.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
      </Head>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <DefaultLayout>
          <Component {...pageProps} />
        </DefaultLayout>
      </ThemeProvider>
    </>
  );
}) as AppType;

export default trpc.withTRPC(MyApp);
