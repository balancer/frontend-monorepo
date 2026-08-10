import { NextRequest } from 'next/server'
import { ChainSlug } from '@repo/lib/modules/pool/pool.utils'
import { captureError, ensureError } from '@repo/lib/shared/utils/errors'
import { createOgScreenshot } from '@bal/lib/og/screenshot'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// public/ is served by the platform (not inside serverless functions), so the
// fallback redirects to the CDN-served asset instead of reading it from disk.
const FALLBACK_IMAGE_URL = '/images/opengraph/og-balancer-pool.jpg'

const CACHE_HEADERS = {
  'Content-Type': 'image/png',
  'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
}

const FALLBACK_HEADERS = {
  'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
}

const POOL_ID_REGEX = /^0x[a-fA-F0-9]{64}$/

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; id: string }> }
) {
  const { chain, id } = await params

  const chainSlugs = Object.values(ChainSlug) as string[]
  if (!chainSlugs.includes(chain) || !POOL_ID_REGEX.test(id)) {
    return new Response('Not found', { status: 404 })
  }

  try {
    const image = await createOgScreenshot({
      path: `/_og/pool/${chain}/${id}`,
      origin: new URL(request.url).origin,
    })

    return new Response(new Uint8Array(image), { headers: CACHE_HEADERS })
  } catch (error: unknown) {
    // Never leak rendering failures; serve the static fallback image instead.
    // Covers render errors AND any unexpected throw (params, launch, module
    // init) so this route can never return 500 to a social crawler.
    try {
      captureError(ensureError(error), { extra: { og: { chain, id } } })
    } catch {
      // Never let error reporting break the fallback response
    }
    return new Response(null, {
      status: 302,
      headers: { Location: FALLBACK_IMAGE_URL, ...FALLBACK_HEADERS },
    })
  }
}
