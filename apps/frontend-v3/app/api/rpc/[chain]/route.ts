import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { drpcUrl } from '@repo/lib/shared/utils/rpc'

type Params = {
  params: {
    chain: string
  }
}

const DRPC_KEY = process.env.NEXT_PRIVATE_DRPC_KEY || ''

export async function POST(request: Request, { params: { chain } }: Params) {
  if (!DRPC_KEY) {
    return new Response(JSON.stringify({ error: 'NEXT_PRIVATE_DRPC_KEY is missing' }), {
      status: 500,
    })
  }

  if (!PROJECT_CONFIG.supportedNetworks.includes(chain as GqlChain)) {
    return new Response(JSON.stringify({ error: `Chain ${chain} not supported in Balancer` }), {
      status: 403,
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
