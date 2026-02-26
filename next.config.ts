// @ts-check

import NextConfig from 'next';

/**
 * @see https://nextjs.org/docs/api-reference/next.config.js/introduction
 */
export default {
  /** We run typechecking as a separate task in CI */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [ {protocol: 'https', hostname: 'raw.githubusercontent.com', pathname: '/**'} ],
  }
} satisfies NextConfig;
