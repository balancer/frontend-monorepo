import { NextRequest, NextResponse } from 'next/server'

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

  try {
    const response = await fetch(imageUrl)

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
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
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 })
  }
}
