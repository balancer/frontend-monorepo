import { hasWhitespace } from './strings'
import { proxyCoinGeckoImage } from '@repo/lib/modules/pool/utils/image-proxy'

export function getBaseUrl() {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000'
  }

  if (window.location.origin) {
    return window.location.origin
  }

  const { protocol, hostname, port } = window.location
  return `${protocol}//${hostname}${port ? ':' + port : ''}`
}

const WEB_URL =
  // eslint-disable-next-line max-len
  /^(https?:\/\/)?([a-zA-Z0-9\p{L}](?:[a-zA-Z0-9\p{L}-]{0,61}[a-zA-Z0-9\p{L}])?\.)+[a-zA-Z\p{L}]{2,}(?:\/[\p{L}\p{N}\p{P}\p{S}\p{M}\-._~!$&'()*+,;=:@%]*)*\/?(?:\?[\p{L}\p{N}\p{P}\p{S}\p{M}\-._~!$&'()*+,;=:@%/?]*)?$/u

export function isValidUrl(maybeUrl?: string): string | true {
  if (!maybeUrl) return true
  if (hasWhitespace(maybeUrl)) return 'URLs containing whitespace are not allowed'

  if (!WEB_URL.test(normalizeUrl(maybeUrl))) {
    return 'Invalid web URL'
  }

  return true
}

export function normalizeUrl(url: string) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) return 'https://' + url
  // Proxy CoinGecko images to avoid CORS issues
  return proxyCoinGeckoImage(url)
}
