import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

type Params = {
  params: {
    chain: string
  }
}

const DRPC_KEY = process.env.NEXT_PRIVATE_DRPC_KEY || ''

const ALLOWED_ORIGINS = [
  ...(process.env.NEXT_PRIVATE_ALLOWED_ORIGINS || '').split(','),
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
].filter(Boolean)

console.log({ vercel_url: process.env.VERCEL_URL })

const dRpcUrl = (chainName: string) =>
  `https://lb.drpc.org/ogrpc?network=${chainName}&dkey=${DRPC_KEY}`

const chainToRpcMap: Record<GqlChain, string | undefined> = {
  [GqlChain.Mainnet]: dRpcUrl('ethereum'),
  [GqlChain.Arbitrum]: dRpcUrl('arbitrum'),
  [GqlChain.Optimism]: dRpcUrl('optimism'),
  [GqlChain.Base]: dRpcUrl('base'),
  [GqlChain.Polygon]: dRpcUrl('polygon'),
  [GqlChain.Avalanche]: dRpcUrl('avalanche'),
  [GqlChain.Fantom]: dRpcUrl('fantom'),
  [GqlChain.Sepolia]: dRpcUrl('sepolia'),
  [GqlChain.Fraxtal]: dRpcUrl('fraxtal'),
  [GqlChain.Gnosis]: dRpcUrl('gnosis'),
  [GqlChain.Mode]: dRpcUrl('mode'),
  [GqlChain.Zkevm]: dRpcUrl('polygon-zkevm'),
  [GqlChain.Sonic]: dRpcUrl('sonic'),
}

function getRpcUrl(chain: string) {
  try {
    const rpc = chainToRpcMap[chain as GqlChain]
    if (!rpc) throw new Error(`Invalid chain: ${chain}`)
    return rpc
  } catch (error) {
    throw new Error(`Invalid chain: ${chain}`)
  }
}

export async function POST(request: Request, { params: { chain } }: Params) {
  const referer = request.headers.get('referer')
  const isAllowedOrigin = referer && ALLOWED_ORIGINS.some(origin => referer.startsWith(origin))

  console.log({ referer })

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

  const rpcUrl = getRpcUrl(chain)
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
