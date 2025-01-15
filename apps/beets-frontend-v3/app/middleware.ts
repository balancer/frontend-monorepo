import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/rpc')) {
    // Add logging for /api/rpc paths
    console.log('Accessed Path:', request.url)
    console.log('User Agent:', request.headers.get('user-agent'))
  }

  const blockedPaths = ['/api/rpc/FANTOM/routes', '/api/rpc/OPTIMISM/routes']

  if (blockedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return new NextResponse('This path is blocked.', { status: 403 })
  }

  return NextResponse.next()
}

// Apply the middleware to all routes
export const config = {
  matcher: ['*'],
}
