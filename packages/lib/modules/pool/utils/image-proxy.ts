/**
 * Proxies external image URLs through the Next.js API to avoid CORS issues
 */
export function proxyExternalImageUrl(originalUrl: string): string {
  try {
    const url = new URL(originalUrl)

    // List of domains that should be proxied
    const proxyDomains = ['assets.coingecko.com', '*.coingecko.com']

    const isExternal = proxyDomains.some(domain => {
      if (domain.startsWith('*.')) {
        // Handle wildcard subdomains
        const baseDomain = domain.slice(2)
        return url.hostname.endsWith(baseDomain) || url.hostname === baseDomain
      }

      return url.hostname === domain
    })

    const isHttps = url.protocol === 'https:'

    if (!isExternal || !isHttps) {
      return originalUrl
    }
  } catch {
    // Invalid URL, return as-is
    return originalUrl
  }

  return `/api/proxy/image?url=${encodeURIComponent(originalUrl)}`
}
