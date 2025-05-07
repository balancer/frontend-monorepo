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
  serverExternalPackages: [
    // Filter out the problematic packages
    ...['import-in-the-middle', 'require-in-the-middle'].filter(
      pkg => !['import-in-the-middle', 'require-in-the-middle'].includes(pkg)
    ),
  ],
  async redirects() {
    return [
      {
        source: '/pool/:id',
        destination: '/pool/:id/detail',
        permanent: false,
      },
      {
        source: '/pool/:id/add',
        destination: '/pool/:id/add-liquidity',
        permanent: false,
      },
      {
        source: '/pool/:id/remove',
        destination: '/pool/:id/remove-liquidity',
        permanent: false,
      },
      {
        source: '/pool/:id/stake',
        destination: '/pool/:id/stake-liquidity',
        permanent: false,
      },
    ].filter(Boolean)
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
export function manifestHeaders() {
  return [
    {
      source: '/manifest.json',
      headers: [
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
      ],
    },
  ]
}
