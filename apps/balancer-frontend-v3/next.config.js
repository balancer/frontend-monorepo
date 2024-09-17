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
  pageExtensions: ['tsx', `${process.env.PROTOCOL}.tsx`, 'ts'],

  // Safe App setup
  headers: manifestHeaders,
}

module.exports = withSentryConfig(nextConfig, sentryOptions)

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
