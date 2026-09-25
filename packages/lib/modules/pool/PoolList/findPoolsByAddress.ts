import { ApolloClient } from '@apollo/client'
import {
  GetPoolDocument,
  GetPoolQuery,
  GqlChain,
} from '@repo/lib/shared/services/api/generated/graphql'
import { isAddress } from 'viem'
import { PoolListItem } from '../pool.types'

export function isPoolAddressSearch(text: string | null | undefined): boolean {
  return Boolean(text && isAddress(text))
}

function getLbpParams(pool: GetPoolQuery['pool']): PoolListItem['lbpParams'] {
  if ('startTime' in pool && 'endTime' in pool && pool.startTime != null && pool.endTime != null) {
    return {
      __typename: 'LiquidityBootstrappingPoolV3Params',
      startTime: pool.startTime,
      endTime: pool.endTime,
    }
  }

  return null
}

export function mapPoolToPoolListItem(pool: GetPoolQuery['pool']): PoolListItem {
  return {
    ...pool,
    __typename: 'GqlPoolMinimal',
    lbpParams: getLbpParams(pool),
    dynamicData: {
      ...pool.dynamicData,
      lifetimeVolume: '0',
      lifetimeSwapFees: '0',
      swapsCount: '0',
    },
  } as unknown as PoolListItem
}

/**
 * Looks up a pool by address/id across chains via poolGetPool.
 * Used when textSearch on poolGetPools returns nothing (e.g. pools missing from the list index).
 */
export async function findPoolsByAddress(
  apolloClient: ApolloClient,
  address: string,
  chains: GqlChain[]
): Promise<PoolListItem[]> {
  const id = address.toLowerCase()

  const results = await Promise.all(
    chains.map(async chain => {
      try {
        const response = await apolloClient.query({
          query: GetPoolDocument,
          variables: { id, chain },
          errorPolicy: 'ignore',
          fetchPolicy: 'network-only',
        })

        return response.data?.pool ? mapPoolToPoolListItem(response.data.pool) : null
      } catch {
        return null
      }
    })
  )

  return results.filter((pool): pool is PoolListItem => pool !== null)
}
