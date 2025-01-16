import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/rpc')) {
    // Add logging for /api/rpc paths
    console.log('Referer:', request.headers.get('referer'))
  }

  const permanentlyRemovedPaths = ['/api/rpc/FANTOM/routes', '/api/rpc/OPTIMISM/routes']

  if (permanentlyRemovedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return new NextResponse('Gone', { status: 410 })
  }

  return NextResponse.next()
}

// Apply the middleware to /api/rpc/* routes
export const config = {
  matcher: ['/api/rpc/:path*'],
}
