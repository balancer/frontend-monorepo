import { hasWhitespace } from './strings'

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

export function isValidUrl(maybeUrl?: string): string | true {
  if (!maybeUrl) return true
  if (hasWhitespace(maybeUrl)) return 'URLs containing whitespace are not allowed'

  let url

  try {
    url = new URL(normalizeUrl(maybeUrl))
  } catch {
    return 'Invalid URL'
  }

  return url.protocol === 'http:' || url.protocol === 'https:' ? true : 'Invalid URL'
}

export function normalizeUrl(url: string) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) return 'https://' + url
  return url
}
