const allowedOrigins = [
  ...(process.env.NEXT_PRIVATE_ALLOWED_ORIGINS || '').split(','),
  process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : '',
].filter(Boolean)

export function isAllowedReferer(referer: string | null): boolean {
  return !!(referer && allowedOrigins.some(origin => referer.startsWith(origin)))
}

export { allowedOrigins as ALLOWED_ORIGINS }
