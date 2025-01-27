'use client'

import {
  getPoolStateWithBalancesCowAmm,
  getPoolStateWithBalancesV2,
  getPoolStateWithBalancesV3,
} from '@balancer/sdk'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { useQuery } from '@tanstack/react-query'
import { useBlockNumber } from 'wagmi'
import { LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import { isV2Pool, isV3Pool } from '../../../pool.helpers'
import { Pool } from '../../../pool.types'
import { getChainId } from '@repo/lib/config/app.config'

export type PoolStateWithBalancesQueryResult = ReturnType<typeof usePoolStateWithBalancesQuery>

export function usePoolStateWithBalancesQuery(pool: Pool) {
  const chainId = getChainId(pool.chain)
  const { data: blockNumber } = useBlockNumber({ chainId })

  const queryKey = [pool.id]

  const helpers = new LiquidityActionHelpers(pool)

  const queryFn = async () => {
    return getSdkPoolStateFn(pool)(helpers.poolState, chainId, getRpcUrl(chainId))
  }

  return useQuery({
    queryKey,
    queryFn,
    gcTime: 0,
    meta: {
      poolId: pool.id,
      chainId,
      blockNumber,
    },
    ...onlyExplicitRefetch,
  })
}

// Returns the function to get the pool state with balances based on the pool version
function getSdkPoolStateFn(pool: Pool) {
  if (isV3Pool(pool)) {
    return getPoolStateWithBalancesV3
  } else if (isV2Pool(pool)) {
    return getPoolStateWithBalancesV2
  } else {
    return getPoolStateWithBalancesCowAmm
  }
}
