/* eslint-disable max-len */
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
import { PoolExample } from './pool-examples/flat'

function astToQueryString(ast: any): string {
  return print(ast)
}

export async function getPoolMock(
  poolId: Address = nested50WETH_50_3poolId,
  chain: GqlChain = GqlChain.Mainnet,
  userAddress?: Address
): Promise<GqlPoolElement> {
  const queryString = astToQueryString(visit(GetPoolDocument, {}))

  const variables: GetPoolQueryVariables = {
    id: poolId,
    chain,
    userAddress,
  }

  const getPoolQuery = (await fetch(process.env.NEXT_PUBLIC_BALANCER_API_URL as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: queryString, variables }),
  })
    .then(response => response.json())
    .then(result => result.data)) as GetPoolQuery

  if (!getPoolQuery?.pool) {
    const errorMessage = `Pool not found in api ${process.env.NEXT_PUBLIC_BALANCER_API_URL} network ${chain} poolId ${poolId}`
    throw new Error(errorMessage)
  }

  return getPoolQuery.pool as GqlPoolElement
}

export function getPoolForTest(poolExample: PoolExample): Promise<GqlPoolElement> {
  return getPoolMock(poolExample.poolId, poolExample.poolChain)
}
