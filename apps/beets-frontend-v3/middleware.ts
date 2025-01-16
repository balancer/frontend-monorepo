import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const permanentlyRemovedPaths = ['/api/rpc/FANTOM/routes', '/api/rpc/OPTIMISM/routes']

  if (permanentlyRemovedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return new NextResponse('Gone', { status: 410 })
  }

  return NextResponse.next()
}

// Apply the middleware to /api/rpc/* routes
export const config = {
  matcher: ['/api/rpc/FANTOM/routes', '/api/rpc/OPTIMISM/routes'],
}
