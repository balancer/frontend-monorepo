import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import type { NextRequest } from 'next/server'
import {
  createForbiddenResponse,
  getAllowedOrigins,
  isAllowedOrigin,
} from '@repo/lib/shared/utils/internal-api/errors'
import { postRpcCall } from '@repo/lib/shared/utils/internal-api/rpc'

type Params = {
  params: Promise<{
    chain: string
  }>
}

export async function POST(request: NextRequest, props: Params) {
  const allowedOrigins = getAllowedOrigins()
  if (!isAllowedOrigin(request, allowedOrigins)) {
    return createForbiddenResponse()
  }

  const params = await props.params
  const { chain } = params
  const rpcResponse = await postRpcCall(request, chain as GqlChain)

  return Response.json(rpcResponse)
}
