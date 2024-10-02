/** @type {import('@sentry/nextjs/build/types/config/types').SentryBuildOptions} */
const sentryOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: 'balancer-labs',
  project: 'frontend-v3',

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

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

const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'prod'
const productionSentryDSN =
  'https://53df88eafd8f9a546b0e926b65553379@o574636.ingest.sentry.io/4506382607712256'
const developmentSentryDSN =
  'https://28291a3b50d248e06f917aa5a98b8fea@o574636.ingest.us.sentry.io/4506944362053632'
const sentryDSN = isProd ? productionSentryDSN : developmentSentryDSN

module.exports = {
  sentryOptions,
  sentryDSN,
}
