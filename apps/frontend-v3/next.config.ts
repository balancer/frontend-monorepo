import { withSentryConfig } from '@sentry/nextjs'
import { sentryOptions } from './sentry.config'
import type { NextConfig } from 'next'

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    // Ship playwright-core's browsers.json (read via runtime require, invisible
    // to static tracing) and the @sparticuz/chromium binary with the OG
    // function. Globbed from the app dir against the pnpm store at the repo root.
    '/api/og/pool/[chain]/[id]': [
      '../../node_modules/.pnpm/@sparticuz+chromium@*/node_modules/@sparticuz/chromium/bin/**/*',
      '../../node_modules/.pnpm/playwright-core@*/node_modules/playwright-core/browsers.json',
    ],
  },
  serverExternalPackages: [
    'thread-stream',
    'real-require',
    'lokijs',
    'encoding',
    // Ship playwright-core and the Chromium binary whole with the OG function:
    // Turbopack traces only the static import graph, so runtime requires like
    // playwright-core's require('browsers.json') would be missing otherwise.
    'playwright-core',
    '@sparticuz/chromium',
  ],
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
    localPatterns: [
      {
        pathname: '/api/proxy/image/**',
      },
      {
        pathname: '/images/**',
      },
    ],
    minimumCacheTTL: 60,
  },
  transpilePackages: ['@repo/lib'],

  // Safe App setup
  headers: manifestHeaders,
  reactCompiler: true,
  redirects: async () => [
    {
      source: '/vebal',
      destination: '/vebal/manage',
      permanent: true,
    },
  ],
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
