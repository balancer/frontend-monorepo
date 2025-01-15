import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
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
