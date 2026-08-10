import { NextRequest } from 'next/server'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ChainSlug } from '@repo/lib/modules/pool/pool.utils'
import { captureError, ensureError } from '@repo/lib/shared/utils/errors'
import { createOgScreenshot } from '@bal/lib/og/screenshot'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const fallbackImage = readFile(join(process.cwd(), 'public/images/opengraph/og-balancer-pool.jpg'))

const CACHE_HEADERS = {
  'Content-Type': 'image/png',
  'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
}

const FALLBACK_HEADERS = {
  'Content-Type': 'image/jpeg',
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
    // Never leak rendering failures; serve the static fallback image instead
    captureError(ensureError(error), { extra: { og: { chain, id } } })
    return new Response(await fallbackImage, { headers: FALLBACK_HEADERS })
  }
}
