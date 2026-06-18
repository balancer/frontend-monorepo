import fetch from 'cross-fetch'

import { visit } from 'graphql/language/visitor'
import { print } from 'graphql'
import type { GqlPoolElement } from '@repo/lib/shared/services/api/generated/graphql-derived-types'
import {
  GetPoolDocument,
  GetPoolQueryVariables,
  GetPoolQuery,
} from '@repo/lib/shared/services/api/generated/graphql'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlChainValues } from '@repo/lib/shared/services/api/generated/graphql-enums'
import { nested50WETH_50_3poolId } from '@repo/lib/debug-helpers'
import { Address } from 'viem'

const FETCH_POOL_MOCK_MAX_ATTEMPTS = 3
const FETCH_POOL_MOCK_RETRY_DELAY_MS = 1_000
const FETCH_POOL_MOCK_RESPONSE_SNIPPET_LENGTH = 500

function astToQueryString(ast: any): string {
  return print(ast)
}

async function sleep(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

type FetchPoolMockParams = {
  poolId?: Address
  chain?: GqlChain
  apiUrl?: string
  userAddress?: Address
}
export async function fetchPoolMock({
  poolId = nested50WETH_50_3poolId,
  chain = GqlChainValues.Mainnet,
  apiUrl = process.env.NEXT_PUBLIC_BALANCER_API_URL as string,
  userAddress,
}: FetchPoolMockParams): Promise<GqlPoolElement> {
  const queryString = astToQueryString(visit(GetPoolDocument, {}))

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
      })
      const responseBody = await response.text()

      if (!response.ok) {
        throw new Error(
          `Pool mock API request failed with status ${response.status} ${response.statusText}. ${formatResponseDetails(response, responseBody)}`
        )
      }

      try {
        getPoolQuery = JSON.parse(responseBody).data as GetPoolQuery
        break
      } catch (error) {
        throw new Error(
          `Pool mock API returned invalid JSON. ${formatResponseDetails(response, responseBody)}`,
          { cause: error }
        )
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

function formatResponseDetails(response: Response, responseBody: string) {
  const contentType = response.headers.get('content-type') || 'unknown content-type'
  const bodySnippet = responseBody.slice(0, FETCH_POOL_MOCK_RESPONSE_SNIPPET_LENGTH)
  return `Content-Type: ${contentType}. Body: ${bodySnippet}`
}
