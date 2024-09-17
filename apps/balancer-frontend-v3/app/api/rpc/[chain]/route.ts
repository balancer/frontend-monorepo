import { GqlChain } from '@/lib/shared/services/api/generated/graphql'

type Params = {
  params: {
    chain: string
  }
}

const ALCHEMY_KEY = process.env.PRIVATE_ALCHEMY_KEY || ''

const chainToRpcMap: Record<GqlChain, string | undefined> = {
  [GqlChain.Mainnet]: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [GqlChain.Arbitrum]: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [GqlChain.Optimism]: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [GqlChain.Base]: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [GqlChain.Polygon]: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [GqlChain.Avalanche]: `https://avax-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [GqlChain.Fantom]: `https://fantom-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [GqlChain.Sepolia]: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [GqlChain.Fraxtal]: `https://frax-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [GqlChain.Gnosis]: `https://gnosis-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [GqlChain.Mode]: undefined,
  [GqlChain.Zkevm]: `https://polygonzkevm-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
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
  if (!ALCHEMY_KEY) {
    return new Response(JSON.stringify({ error: 'PRIVATE_ALCHEMY_KEY is missing' }), {
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
