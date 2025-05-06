import { NextResponse } from 'next/server'
import { drpcUrl } from '@repo/lib/shared/utils/rpc'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

const DRPC_KEY = process.env.NEXT_PRIVATE_DRPC_KEY || ''

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : '',
].filter(Boolean)

export async function POST(request: Request, context: { params: { chain: string } }) {
  const { chain } = context.params
  const referer = request.headers.get('referer')
  const isAllowedOrigin = referer && ALLOWED_ORIGINS.some(origin => referer.startsWith(origin))

  if (!isAllowedOrigin) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  if (!chain) {
    return new Response('Chain parameter is required', {
      status: 400,
    })
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rpcBody),
  })

  const rpcData = await rpcResponse.json()

  return NextResponse.json(rpcData)
}
