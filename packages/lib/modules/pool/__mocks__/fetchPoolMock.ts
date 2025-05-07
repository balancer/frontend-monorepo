 
import fetch from 'cross-fetch'

import { visit } from 'graphql/language/visitor'
import { print } from 'graphql'
import {
  GetPoolDocument,
  GetPoolQueryVariables,
  GqlChain,
  GetPoolQuery,
  GqlPoolElement,
} from '@repo/lib/shared/services/api/generated/graphql'
import { nested50WETH_50_3poolId } from '@repo/lib/debug-helpers'
import { Address } from 'viem'

function astToQueryString(ast: any): string {
  return print(ast)
}

type FetchPoolMockParams = {
  poolId?: Address
  chain?: GqlChain
  apiUrl?: string
  userAddress?: Address
}
export async function fetchPoolMock({
  poolId = nested50WETH_50_3poolId,
  chain = GqlChain.Mainnet,
  apiUrl = process.env.NEXT_PUBLIC_BALANCER_API_URL as string,
  userAddress,
}: FetchPoolMockParams): Promise<GqlPoolElement> {
  const queryString = astToQueryString(visit(GetPoolDocument, {}))

  const variables: GetPoolQueryVariables = {
    id: poolId,
    chain,
    userAddress,
  }

  const getPoolQuery = (await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: queryString, variables }),
  })
    .then(response => response.json())
    .then(result => result.data)) as GetPoolQuery

  if (!getPoolQuery?.pool) {
    const errorMessage = `Pool not found in api ${apiUrl} network ${chain} poolId ${poolId}`
    throw new Error(errorMessage)
  }

  return getPoolQuery.pool as GqlPoolElement
}
