import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/og/*'],
      disallow: '/private/',
    },
    sitemap: 'https://balancer.fi/sitemap.xml',
  }
}
