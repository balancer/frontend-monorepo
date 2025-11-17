import type { NextConfig } from 'next'

/** @type {import('next').NextConfig} */
const config: NextConfig = {
  turbopack: {
    //
  },
  serverExternalPackages: ['pino-pretty', 'lokijs', 'encoding'],
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

  async redirects() {
    const redirects: Array<{
      source: string
      destination: string
      permanent: boolean
    }> = [
      {
        source: '/discord',
        destination: 'https://discord.gg/kbPnYJjvwZ',
        permanent: false,
      },
    ]

    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
      redirects.push({
        source: '/mabeets',
        destination: 'https://ma.beets.fi/',
        permanent: false,
      })
    }

    // TODO: remove when loops goes live
    if (process.env.NEXT_PUBLIC_APP_ENV === 'prod') {
      redirects.push({
        source: '/loops',
        destination: '/',
        permanent: false,
      })
    }

    return redirects
  },
}

export default config

/**
 * Add specific CORS headers to the manifest.json file
 * This is required to allow the Safe Browser to fetch the manifest file
 * More info: https://help.safe.global/en/articles/40859-add-a-custom-safe-app
 */
export async function manifestHeaders() {
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
