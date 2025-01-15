import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/rpc')) {
    // Add logging for /api/rpc paths
    console.log('Referrer:', request.headers.get('referer'))
  }

  const blockedPaths = ['/api/rpc/FANTOM/routes', '/api/rpc/OPTIMISM/routes']

  if (blockedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return new NextResponse('This path is blocked.', { status: 403 })
  }

  return NextResponse.next()
}

// Apply the middleware to /api/rpc/* routes
export const config = {
  matcher: ['/api/rpc/:path*'],
}
