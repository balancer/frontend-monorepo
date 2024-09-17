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
