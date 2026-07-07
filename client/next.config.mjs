import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';
import withSerwistInit from '@serwist/next';

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => import("next").NextConfig} */
const nextConfig = (phase) => {
  const withSerwist = withSerwistInit({
    swSrc: 'app/sw.ts',
    swDest: 'public/sw.js',
    disable: phase === PHASE_DEVELOPMENT_SERVER,
  });

  return withSerwist({
    eslint: {
      ignoreDuringBuilds: true,
    },
  });
};

export default nextConfig;
