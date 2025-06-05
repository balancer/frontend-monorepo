import type { SentryBuildOptions } from '@sentry/nextjs/build/types/config/types'

/** @type {import('@sentry/nextjs/build/types/config/types').SentryBuildOptions} */
export const sentryOptions: SentryBuildOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: 'skloon',
  project: 'frontend',

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
}

export const sentryDSN = process.env.NEXT_PUBLIC_SENTRY_DSN
