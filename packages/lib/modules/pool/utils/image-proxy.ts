/**
 * Proxies CoinGecko image URLs through the Next.js API to avoid CORS issues
 */
export function proxyCoinGeckoImage(originalUrl: string): string {
  if (!originalUrl.includes('assets.coingecko.com')) {
    return originalUrl
  }

  return `/api/proxy/image?url=${encodeURIComponent(originalUrl)}`
}
