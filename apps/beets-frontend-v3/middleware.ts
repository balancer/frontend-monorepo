import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/rpc')) {
    // Add logging for /api/rpc paths
    console.log('Referer:', request.headers.get('referer'))
  }

  return NextResponse.next()
}

// Apply the middleware to /api/rpc/* routes
export const config = {
  matcher: ['/api/rpc/:path*'],
}
