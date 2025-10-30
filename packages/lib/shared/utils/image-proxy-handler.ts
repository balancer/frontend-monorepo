import { NextRequest, NextResponse } from 'next/server'
import { secondsToMilliseconds } from 'date-fns'

/**
 * Generic image proxy handler to avoid CORS issues with external images
 * Particularly useful for CoinGecko assets that don't have proper CORS headers
 */
export async function handleImageProxy(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 })
  }

  // Validate URL format and protocol
  let parsedUrl: URL

  try {
    parsedUrl = new URL(imageUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }

  // Restrict to HTTPS only for security
  if (parsedUrl.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only HTTPS URLs are allowed' }, { status: 400 })
  }

  // Implement allowlist of permitted domains
  const allowedDomains = ['coingecko.com', 'assets.coingecko.com']
  const hostname = parsedUrl.hostname

  if (!allowedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
    return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 })
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), secondsToMilliseconds(10))

  try {
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      redirect: 'follow', // Be explicit about redirect handling
      headers: {
        'User-Agent': 'ImageProxy/1.0', // Identify your proxy
      },
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 })
    }

    // Check content size before buffering (limit to 10MB)
    const contentLength = response.headers.get('content-length')
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (contentLength && parseInt(contentLength) > maxSize) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 })
    }

    const imageBuffer = await response.arrayBuffer()

    // Double-check actual buffer size
    if (imageBuffer.byteLength > maxSize) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 })
    }

    const contentType = response.headers.get('content-type') || 'image/png'

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Image proxy failed:', error)
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 })
    }

    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 })
  }
}
