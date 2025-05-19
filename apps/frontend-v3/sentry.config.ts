import type { SentryBuildOptions } from '@sentry/nextjs/build/types/config/types'

const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'prod'

// Source map generation and upload makes the build much slower so we only enable it for vercel production builds from main branch
const shouldEnableSourceMaps = isProd && process.env.VERCEL_GIT_COMMIT_REF === 'main'

/** @type {import('@sentry/nextjs/build/types/config/types').SentryBuildOptions} */
export const sentryOptions: SentryBuildOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: 'balancer-labs',
  project: isProd ? 'frontend-v3' : 'frontend-v3-develop',

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: false,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,

  sourcemaps: {
    disable: !shouldEnableSourceMaps,
  },
  telemetry: shouldEnableSourceMaps,
}

const productionSentryDSN =
  'https://53df88eafd8f9a546b0e926b65553379@o574636.ingest.sentry.io/4506382607712256'
const developmentSentryDSN =
  'https://28291a3b50d248e06f917aa5a98b8fea@o574636.ingest.us.sentry.io/4506944362053632'
export const sentryDSN = isProd ? productionSentryDSN : developmentSentryDSN
