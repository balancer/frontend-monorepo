import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/og/*'],
      disallow: ['/private/', '/_og/'],
    },
    sitemap: 'https://balancer.fi/sitemap.xml',
  }
}
