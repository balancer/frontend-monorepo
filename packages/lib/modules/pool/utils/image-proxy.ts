/**
 * Proxies CoinGecko image URLs through the Next.js API to avoid CORS issues
 */
export function proxyCoinGeckoImage(originalUrl: string): string {
  try {
    const url = new URL(originalUrl)

    const isCoingecko =
      url.hostname === 'assets.coingecko.com' || url.hostname.endsWith('.coingecko.com')

    const isHttps = url.protocol === 'https:'

    if (!isCoingecko || !isHttps) {
      return originalUrl
    }
  } catch {
    // Invalid URL, return as-is
    return originalUrl
  }

  return `/api/proxy/image?url=${encodeURIComponent(originalUrl)}`
}
