import fetch from 'cross-fetch'

import { visit } from 'graphql/language/visitor'
import { print } from 'graphql'
import type { GqlPoolElement } from '@repo/lib/shared/services/api/graphql-derived-types'
import {
  GetPoolDocument,
  GetPoolQueryVariables,
  GetPoolQuery,
} from '@repo/lib/shared/services/api/generated/graphql'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { nested50WETH_50_3poolId } from '@repo/lib/debug-helpers'
import { Address } from 'viem'

const FETCH_POOL_MOCK_MAX_ATTEMPTS = 3
const FETCH_POOL_MOCK_RETRY_DELAY_MS = 1_000

function astToQueryString(ast: any): string {
  return print(ast)
}

async function sleep(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

export const stakedBalanceQuery = `
  query GetPool($id: String!, $chain: GqlChain!, $userAddress: String) {
    pool: poolGetPool(id: $id, chain: $chain, userAddress: $userAddress) {
      id
      address
      chain
      staking {
        gauge {
          gaugeAddress
          otherGauges {
            gaugeAddress
          }
        }
      }
    }
  }
`

export const poolEnrichQuery = `
  query GetPool($id: String!, $chain: GqlChain!, $userAddress: String) {
    pool: poolGetPool(id: $id, chain: $chain, userAddress: $userAddress) {
      id
      address
      chain
      type
      protocolVersion
      dynamicData {
        totalLiquidity
        totalShares
      }
      poolTokens {
        address
        decimals
        balance
        hasNestedPool
        nestedPool {
          totalShares
          totalLiquidity
          nestedPercentage
          nestedShares
          tokens {
            address
            decimals
            balance
          }
        }
      }
    }
  }
`

export const swapPoolQuery = `
  query GetPool($id: String!, $chain: GqlChain!, $userAddress: String) {
    pool: poolGetPool(id: $id, chain: $chain, userAddress: $userAddress) {
      chain
    }
  }
`

export const minimalPoolQuery = `
  query GetPool($id: String!, $chain: GqlChain!, $userAddress: String) {
    pool: poolGetPool(id: $id, chain: $chain, userAddress: $userAddress) {
      id
      address
      chain
      type
      protocolVersion
      tags
      dynamicData {
        totalShares
      }
      poolTokens {
        address
        decimals
        balance
        weight
        index
        symbol
        name
        isErc4626
        useUnderlyingForAddRemove
        hasNestedPool
        underlyingToken {
          address
          decimals
          name
          symbol
        }
        nestedPool {
          id
          address
          type
          bptPriceRate
          totalShares
          totalLiquidity
          nestedPercentage
          nestedShares
          tokens {
            address
            decimals
            balance
            weight
            index
            symbol
            name
            isErc4626
            useUnderlyingForAddRemove
            underlyingToken {
              address
              decimals
              name
              symbol
            }
          }
        }
      }
    }
  }
`

type FetchPoolMockParams = {
  poolId?: Address
  chain?: GqlChain
  apiUrl?: string
  userAddress?: Address
  query?: string
}
export async function fetchPoolMock({
  poolId = nested50WETH_50_3poolId,
  chain = GqlChainValues.Mainnet,
  apiUrl = process.env.NEXT_PUBLIC_BALANCER_API_URL as string,
  userAddress,
  query,
}: FetchPoolMockParams): Promise<GqlPoolElement> {
  const queryString = query ?? astToQueryString(visit(GetPoolDocument, {}))

  const variables: GetPoolQueryVariables = {
    id: poolId,
    chain,
    userAddress,
  }

  let lastError: unknown
  let getPoolQuery: GetPoolQuery | undefined

  for (let attempt = 1; attempt <= FETCH_POOL_MOCK_MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryString, variables }),
        compress: false,
      } as RequestInit & { compress?: boolean })
      const responseBody = await response.text()

      if (!response.ok) {
        throw new Error(
          `Pool mock API request failed with status ${response.status} ${response.statusText}`
        )
      }

      try {
        getPoolQuery = JSON.parse(responseBody).data as GetPoolQuery
        break
      } catch (error) {
        throw new Error('Pool mock API returned invalid JSON', { cause: error })
      }
    } catch (error) {
      lastError = error
      if (attempt < FETCH_POOL_MOCK_MAX_ATTEMPTS) await sleep(FETCH_POOL_MOCK_RETRY_DELAY_MS)
    }
  }

  if (!getPoolQuery && lastError) throw lastError

  if (!getPoolQuery?.pool) {
    const errorMessage = `Pool not found in api ${apiUrl} network ${chain} poolId ${poolId}`
    throw new Error(errorMessage)
  }

  return getPoolQuery.pool as GqlPoolElement
}
