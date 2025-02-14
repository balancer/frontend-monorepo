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

  let url

  try {
    url = new URL(maybeUrl)
  } catch (_) {
    return 'Invalid URL'
  }

  return url.protocol === 'http:' || url.protocol === 'https:' ? true : 'Invalid URL'
}
