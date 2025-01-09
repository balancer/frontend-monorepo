import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isAllowedOrigin = (origin: string): boolean => {
  // Allow local development
  if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
    return true
  }

  // Allow production domain
  if (origin === process.env.ALLOWED_ORIGIN) {
    return true
  }

  // Allow all origins in preview deployments
  if (process.env.VERCEL_ENV === 'preview') {
    return true
  }

  return false
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || ''

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    })
    return response
  }

  if (isAllowedOrigin(origin)) {
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.set('Access-Control-Max-Age', '86400')
    return response
  }

  // Block requests from unauthorized origins
  return new NextResponse(null, { status: 403 })
}

export const config = {
  matcher: '/api/:path*',
}
