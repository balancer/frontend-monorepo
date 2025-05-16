import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { drpcUrl } from '@repo/lib/shared/utils/rpc'
import type { NextRequest } from 'next/server'

type Params = {
  params: Promise<{
    chain: string
  }>
}

const DRPC_KEY = process.env.NEXT_PRIVATE_DRPC_KEY || ''

const ALLOWED_ORIGINS = [
  ...(process.env.NEXT_PRIVATE_ALLOWED_ORIGINS || '').split(','),
  process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : '',
].filter(Boolean)

export async function POST(request: NextRequest, props: Params) {
  const params = await props.params
  const { chain } = params
  const referer = request.headers.get('referer')
  const isAllowedOrigin = referer && ALLOWED_ORIGINS.some(origin => referer.startsWith(origin))

  if (!isAllowedOrigin) {
    return new Response(
      JSON.stringify({
        error: 'Forbidden: Access denied',
        code: -32000,
        message: 'Access denied',
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }

  if (!DRPC_KEY) {
    return new Response(JSON.stringify({ error: 'NEXT_PRIVATE_DRPC_KEY is missing' }), {
      status: 500,
    })
  }

  const rpcUrl = drpcUrl(chain as GqlChain, DRPC_KEY)
  const rpcBody = await request.json()

  const rpcResponse = await fetch(rpcUrl, {
    method: 'POST',
    body: JSON.stringify(rpcBody),
    next: {
      revalidate: 0,
    },
  })

  const rpcResponseJson = await rpcResponse.json()

  return Response.json(rpcResponseJson)
}
