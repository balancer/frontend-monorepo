const { withSentryConfig } = require('@sentry/nextjs')
const { sentryOptions } = require('./sentry.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  transpilePackages: ['@repo/lib'],
  serverExternalPackages: [
    // Filter out the problematic packages
    ...['import-in-the-middle', 'require-in-the-middle'].filter(
      pkg => !['import-in-the-middle', 'require-in-the-middle'].includes(pkg)
    ),
  ],

  // Safe App setup
  headers: manifestHeaders,
  redirects() {
    return [
      {
        source: '/discord',
        destination: 'https://discord.gg/kbPnYJjvwZ',
        permanent: false,
      },
      // temporary redirect for urls to OP pools from the old app (mainly for Aura)
      {
        source: '/pool/:path*',
        destination: '/pools/optimism/v2/:path*',
        permanent: false,
      },
      // redirect for /mabeets in prod
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' && {
        source: '/mabeets',
        destination: 'https://ma.beets.fi/',
        permanent: false,
      },
    ].filter(Boolean)
  },
}

// Avoid sentry setup in CI
module.exports =
  process.env.CI === 'true' ? nextConfig : withSentryConfig(nextConfig, sentryOptions)

/**
 * Add specific CORS headers to the manifest.json file
 * This is required to allow the Safe Browser to fetch the manifest file
 * More info: https://help.safe.global/en/articles/40859-add-a-custom-safe-app
 */
async function manifestHeaders() {
  const corsHeaders = [
    {
      key: 'Access-Control-Allow-Origin',
      value: '*',
    },
    {
      key: 'Access-Control-Allow-Methods',
      value: 'GET',
    },
    {
      key: 'Access-Control-Allow-Headers',
      value: 'X-Requested-With, content-type, Authorization',
    },
  ]
  return [
    {
      source: '/manifest.json',
      headers: corsHeaders,
    },
    {
      source: '/pools/manifest.json',
      headers: corsHeaders,
    },
  ]
}
