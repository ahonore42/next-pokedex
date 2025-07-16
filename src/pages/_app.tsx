import type { NextPage } from 'next';
import type { AppType, AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import { DefaultLayout } from '~/components/layout/DefaultLayout';
import { LoadingProvider } from '~/lib/contexts/LoadingContext';
import { trpc } from '~/utils/trpc';
import '~/styles/globals.css';
import '@xyflow/react/dist/style.css';

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
        <LoadingProvider>
          <DefaultLayout>
            <Component {...pageProps} />
          </DefaultLayout>
        </LoadingProvider>
      </ThemeProvider>
    </>
  );
}) as AppType;

export default trpc.withTRPC(MyApp);
