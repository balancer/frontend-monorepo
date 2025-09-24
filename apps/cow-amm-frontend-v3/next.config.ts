import { withSentryConfig } from '@sentry/nextjs'
import { sentryOptions } from './sentry.config'
import type { NextConfig } from 'next'

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
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

  // Safe App setup
  headers: manifestHeaders,

  async redirects() {
    const redirects: Array<{
      source: string
      destination: string
      permanent: boolean
    }> = [
      {
        source: '/',
        destination: '/pools',
        permanent: true,
      },
      {
        source: '/swap',
        destination: 'https://balancer.fi/swap',
        permanent: true,
      },
      {
        source: '/portfolio',
        destination: 'https://balancer.fi/portfolio',
        permanent: true,
      },
      {
        source: '/vebal',
        destination: 'https://balancer.fi/vebal',
        permanent: true,
      },
    ]

    return redirects
  },
}

// Avoid sentry setup in CI
const config = process.env.CI === 'true' ? nextConfig : withSentryConfig(nextConfig, sentryOptions)

export default config

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
