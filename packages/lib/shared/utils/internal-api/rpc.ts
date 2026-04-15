import { NextRequest } from 'next/server'
import { GqlChain } from '../../services/api/generated/graphql'
import { drpcUrl } from '../rpc'

const DRPC_KEY = process.env.NEXT_PRIVATE_DRPC_KEY || ''

const RPC_TIMEOUT_MS = 15000 // 15s timeout for dRPC calls

export async function postRpcCall(request: NextRequest, chain: GqlChain) {
  if (!DRPC_KEY) {
    return new Response(JSON.stringify({ error: 'NEXT_PRIVATE_DRPC_KEY is missing' }), {
      status: 500,
    })
  }

  const rpcUrl = drpcUrl(chain, DRPC_KEY)
  const rpcBody = await request.json()

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS)

  try {
    const rpcResponse = await fetch(rpcUrl, {
      method: 'POST',
      body: JSON.stringify(rpcBody),
      signal: controller.signal,
      keepalive: true, // Prevent browser from cancelling long requests
      next: {
        revalidate: 0,
      },
    })
    clearTimeout(timeoutId)

    if (!rpcResponse.ok) {
      return new Response(JSON.stringify({ error: `RPC HTTP error: ${rpcResponse.status}` }), {
        status: rpcResponse.status,
      })
    }

    return rpcResponse.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(JSON.stringify({ error: 'RPC timeout after 15s' }), { status: 504 })
    }
    throw error
  }
}
